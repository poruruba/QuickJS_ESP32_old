#include <Arduino.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include <ArduinoJson.h>
#include <unordered_map> 

#include "endpoint_config.h"
#include "endpoint_types.h"
#include "endpoint_udpApi.h"

static StaticJsonDocument<UDP_JSON_DOCUMENT_SIZE> udpRequest;
static StaticJsonDocument<UDP_JSON_DOCUMENT_SIZE> udpResponse;
static char udpRequestBuffer[UDP_BUFFER_SIZE];
static char udpResponseBuffer[UDP_BUFFER_SIZE];

static std::unordered_map<std::string, EndpointEntry*> endpoint_list;
static WiFiUDP udp;

long wifi_connect(const char *ssid, const char *password)
{
  Serial.println("");
  Serial.print("WiFi Connenting");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(1000);
  }
  Serial.println("");
  Serial.print("Connected : IP=");
  Serial.print(WiFi.localIP());
  Serial.print(" Mac=");
  Serial.println(WiFi.macAddress());

  return 0;
}

void udpapi_appendEntry(EndpointEntry *tables, int num_of_entry)
{
  for(int i = 0 ; i < num_of_entry ; i++ )
    endpoint_list[tables[i].name] = &tables[i];
}

void udpapi_initialize(void)
{
#if defined(ARDUINO_M5Stick_C)
  M5.begin(true, true, true);
#elif defined(ARDUINO_M5STACK_Core2)
  M5.begin(true, true, true, true);
#endif
  Serial.begin(115200);
  Serial.println("[initializing]");

  wifi_connect(WIFI_SSID, WIFI_PASSWORD);

  udp.begin(UDP_REQUEST_PORT);

  if (!MDNS.begin(MDNS_NAME)){
    Serial.println("MDNS.begin error");
  }else{
    MDNS.addService(MDNS_SERVICE, "udp", UDP_REQUEST_PORT);
    Serial.printf("MDNS_NAME: %s, serivce_name: %s, UDP_PORT: %d\n", MDNS_NAME, MDNS_SERVICE, UDP_REQUEST_PORT);
  }
}

void udpapi_update(void)
{
  int packetSize = udp.parsePacket();
  if( packetSize <= 0 || packetSize > sizeof(udpRequestBuffer))
    return;

  int len = udp.read(udpRequestBuffer, packetSize);
  if( len <= 0 )
    return;
  Serial.printf("UDP received(%d)\n", len);

  DeserializationError err = deserializeJson(udpRequest, udpRequestBuffer, len);
  if( err ){
    Serial.printf("deserializeJson error: %s\n", err.c_str());
    return;
  }

  const char *endpoint = udpRequest["endpoint"];
  bool oneway = udpRequest["oneway"];
  uint32_t msgId = udpRequest["msgId"];
  std::unordered_map<std::string, EndpointEntry*>::iterator itr = endpoint_list.find(endpoint);
  if( itr != endpoint_list.end() ){
    EndpointEntry *entry = itr->second;
    JsonObject responseResult = udpapi_makeResponse(endpoint, msgId);
    long ret = entry->impl(udpRequest["params"], responseResult, entry->magic);
    if( ret != 0 ){
      responseResult = udpapi_makeResponse(endpoint, msgId);
      responseResult["status"] = "NG";
      responseResult["message"] = "unknown";
    }
    if( !oneway )
      udpapi_responsePublish(udp.remoteIP());
    return;
  }

  Serial.println("endpoint not found");
}

JsonObject udpapi_makeResponse(const char *endpoint, uint32_t msgId)
{
  JsonObject jsonObject = udpResponse.to<JsonObject>();
  jsonObject["client"]["ipaddress"] = (char*)WiFi.localIP().toString().c_str();
  jsonObject["status"] = "OK";
  jsonObject["msgId"] = msgId;
  jsonObject["endpoint"] = (char*)endpoint;

  return jsonObject;
}

long udpapi_responsePublish(IPAddress address)
{
  long length = serializeJson(udpResponse, udpResponseBuffer, sizeof(udpResponseBuffer));
  if( length <= 0 ){
    Serial.println("Udp buffer size over");
    return -1;
  }

  udp.beginPacket(address, UDP_REPORT_PORT);
  udp.write((uint8_t*)udpResponseBuffer, strlen(udpResponseBuffer));
  udp.endPacket();

  return 0;
}
