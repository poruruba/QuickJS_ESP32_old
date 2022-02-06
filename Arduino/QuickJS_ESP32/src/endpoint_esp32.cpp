#include <Arduino.h>
#include <WiFi.h>

#include "endpoint_types.h"
#include "endpoint_esp32.h"

long endp_restart(JsonObject request, JsonObject response, int magic)
{
  ESP.restart();
  return 0;
}

long endp_millis(JsonObject request, JsonObject response, int magic)
{
  response["result"] = millis();
  return 0;
}

long endp_getIpAddress(JsonObject request, JsonObject response, int magic)
{
  IPAddress address = WiFi.localIP();
  response["result"] = (uint32_t)(((uint32_t)address[0]) << 24 | address[1] << 16 | address[2] << 8 | address[3]);

  return 0;
}

long endp_getMacAddress(JsonObject request, JsonObject response, int magic)
{
  uint8_t address[6];
  WiFi.macAddress(address);
  for( int i = 0 ; i < 6 ; i++ )
    response["result"][i] = address[i];

  return 0;
}

EndpointEntry esp32_table[] = {
  EndpointEntry{ endp_restart, "/restart", 0 },
  EndpointEntry{ endp_millis, "/millis", 0 },
  EndpointEntry{ endp_getIpAddress, "/getIpAddress", 0 },
  EndpointEntry{ endp_getMacAddress, "/getMacAddress", 0 },
};
const int num_of_esp32_entry = sizeof(esp32_table) / sizeof(EndpointEntry);
