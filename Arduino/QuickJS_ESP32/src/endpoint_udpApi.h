#ifndef _ENDPOINT_UDPAPI_H_
#define _ENDPOINT_UDPAPI_H_

#include <WiFi.h>
#include "endpoint_types.h"

void udpapi_initialize(void);
void udpapi_update(void);
void udpapi_appendEntry(EndpointEntry *tables, int num_of_entry);
JsonObject udpapi_makeResponse(const char *endpoint, uint32_t msgId);
long udpapi_responsePublish(IPAddress address);

#endif
