#include <Arduino.h>
#include <ArduinoJson.h>
#include "quickjs_esp32.h"
#include "module_config.h"

#include "endpoint_udpApi.h"
#include "endpoint_types.h"
#include "endpoint_esp32.h"
#include "endpoint_gpio.h"
#include "endpoint_ledc.h"
#include "endpoint_pixels.h"
#include "endpoint_wire.h"

#define JSDOCUMENT_MODULES_SIZE 2000

static unsigned long g_jscode_len = 0;
static char jscode[JSCODE_BUFFER_SIZE];
static char load_buffer[JSMODULE_BUFFER_SIZE];

extern const char jscode_default[] asm("_binary_rom_default_js_start");
extern const char jscode_epilogue[] asm("_binary_rom_epilogue_js_start");

static ESP32QuickJS qjs;

static String makeMacAddressUrl(const char *base_url, const char *ext);
static String makeIpAddressUrl(const char *base_url, const char *ext);
static long load_jscode(const char *main_url);
static long load_jsmodules(const char *modules_url);
static long load_jsmodules_and_jscode(const char *url);
static int str_cmp_end(const char* s1, const char *macher);

void setup()
{
  udpapi_initialize();
  
  udpapi_appendEntry(esp32_table, num_of_esp32_entry);
  udpapi_appendEntry(gpio_table, num_of_gpio_entry);
  udpapi_appendEntry(wire_table, num_of_wire_entry);
  udpapi_appendEntry(ledc_table, num_of_ledc_entry);
  udpapi_appendEntry(pixels_table, num_of_pixels_entry);

  qjs.initialize_modules();
  qjs.begin();

  long ret = load_jsmodules_and_jscode(NULL);
  if( ret == 0 ){
    Serial.println("[executing]");
    qjs.exec(jscode);
  }else{
    qjs.exec(jscode_default);
  }
}

void loop()
{
  // For timer, async, etc.
  if( qjs.loop() ){
    qjs.end();
    qjs.begin();

    long ret = load_jsmodules_and_jscode(qjs.reload_url);
    if( ret == 0 ){
      qjs.exec(jscode);
    }else{
      qjs.exec(jscode_default);
    }
  }

  udpapi_update();
}

static String makeMacAddressUrl(const char *base_url, const char *ext)
{
  uint8_t address[6];
  WiFi.macAddress(address);

  char temp[6 * 2 + 1];
  sprintf(temp, "%02x%02x%02x%02x%02x%02x", address[0], address[1], address[2], address[3], address[4], address[5]);

  String url(base_url);
  url += "/";
  url += temp;
  url += ext;

  return url;
}

static String makeIpAddressUrl(const char *base_url, const char *ext)
{
  IPAddress address = WiFi.localIP();

  char temp[4 * 2 + 1];
  sprintf(temp, "%02x%02x%02x%02x", address[0], address[1], address[2], address[3]);

  String url(base_url);
  url += "/";
  url += temp;
  url += ext;

  return url;
}

static long load_jscode(const char *main_url)
{
  long ret;
  unsigned long jscode_len = sizeof(jscode) - strlen(jscode_epilogue) - 1;
  ret = http_get_binary(main_url, (uint8_t *)jscode, &jscode_len);
  if (ret != 0)
    return ret;

  jscode[jscode_len] = '\0';
  strcat(jscode, jscode_epilogue);
  jscode_len += strlen(jscode_epilogue);

  g_jscode_len = jscode_len;

  return 0;
}

static long load_jsmodules(const char *modules_url)
{
  long ret;
  DynamicJsonDocument doc(JSDOCUMENT_MODULES_SIZE);
  ret = http_get_json(modules_url, &doc);
  if( ret != 0 )
    return ret;

  unsigned long load_buffer_len = 0;
  JsonArray array = doc["modules"].as<JsonArray>();
  for (JsonVariant val : array){
    const char *url = val["url"];
    const char *name = val["name"];

    Serial.println(name);
    unsigned long buffer_len = sizeof(load_buffer) - load_buffer_len - 1;
    long ret = http_get_binary(url, (uint8_t *)&load_buffer[load_buffer_len], &buffer_len);
    if (ret != 0){
      Serial.println("module get error");
      return ret;
    }
    load_buffer[load_buffer_len + buffer_len] = '\0';

    qjs.load_module(&load_buffer[load_buffer_len], buffer_len, name);
    load_buffer_len += buffer_len + 1;
  }

  const char *url = doc["main"]["url"];
  const char *name = doc["main"]["name"];
  if( url == NULL )
    return 0;

  if( name )
    Serial.println(name);

  return load_jscode(url);
}

static long load_jsmodules_and_jscode(const char *url)
{
  long ret = -1;
  g_jscode_len = 0;

  if( url != NULL && url[0] != '\0' ){
    if( str_cmp_end(url, ".json") == 0 ){
      ret = load_jsmodules(url);
      if( ret == 0 && g_jscode_len == 0 ){
        ret = load_jscode(makeMacAddressUrl(jscode_base_url, ".js").c_str());
        if (ret != 0){
          ret = load_jscode(makeIpAddressUrl(jscode_base_url, ".js").c_str());
          if (ret != 0){
            ret = load_jscode(jscode_main_url);
          }
        }
      }
    }else if( str_cmp_end(url, ".js") == 0 ){
      ret = load_jscode(url);
    }else{
      Serial.println("unknown url");
    }
  }else{
    ret = load_jsmodules(makeMacAddressUrl(jscode_base_url, ".json").c_str());
    if( ret != 0 ){
      ret = load_jsmodules(makeIpAddressUrl(jscode_base_url, ".json").c_str());
      if( ret != 0 ){
        ret = load_jsmodules(jscode_modules_url);
      }
    }

    if( g_jscode_len == 0 ){
      ret = load_jscode(makeMacAddressUrl(jscode_base_url, ".js").c_str());
      if (ret != 0){
        ret = load_jscode(makeIpAddressUrl(jscode_base_url, ".js").c_str());
        if (ret != 0){
          ret = load_jscode(jscode_main_url);
        }
      }
    }
  }

  return ret;
}

static int str_cmp_end(const char* s1, const char *matcher){
  int len1 = strlen(s1);
  int len = strlen(matcher);
  if( len1 < len )
    return -1;
  for( int i = 0 ; i < len ; i++ ){
    if( s1[len1 - i - 1] != matcher[len - i - 1] )
      return -1; 
  }

  return 0;
}