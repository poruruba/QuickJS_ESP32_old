#ifndef _MODULE_MQTT_H_
#define _MODULE_MQTT_H_

#include "quickjs.h"

JSModuleDef *addModule_mqtt(JSContext *ctx, JSValue global);
void loopModule_mqtt(void);
void endModule_mqtt(void);

#endif
