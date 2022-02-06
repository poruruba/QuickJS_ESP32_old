#ifndef _MODULE_RTC_H_
#define _MODULE_RTC_H_

#include "quickjs.h"

long initialize_rtc(void);
JSModuleDef *addModule_rtc(JSContext *ctx, JSValue global);

#endif
