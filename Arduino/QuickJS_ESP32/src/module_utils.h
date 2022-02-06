#ifndef _MODULE_UTILS_H_
#define _MODULE_UTILS_H_

#include <ArduinoJson.h>
#include "quickjs.h"
#include "module_config.h"

JSModuleDef *addModule_utils(JSContext *ctx, JSValue global);

long http_get(String url, String *response);
long http_get_binary(String url, uint8_t *p_buffer, unsigned long *p_len);
long http_get_json(String url, JsonDocument *doc);

#ifdef _LOGIO_ENABLE_
void logio_log(const char* message);
void logio_log2(const char* source, const char* message);
void logio_log3(const char* stream, const char* source, const char* message);
#endif

#endif