#ifndef _MODULE_ESP32_H_
#define _MODULE_ESP32_H_

#include "quickjs.h"

JSModuleDef *addModule_esp32(JSContext *ctx, JSValue global);
void loopModule_esp32(void);

#ifdef _LOGIO_ENABLE_
JSModuleDef *addModule_console(JSContext *ctx, JSValue global);
#endif


#endif
