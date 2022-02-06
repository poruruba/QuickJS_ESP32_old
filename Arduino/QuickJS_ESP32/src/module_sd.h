#ifndef _MODULE_SD_H_
#define _MODULE_SD_H_

#include "quickjs.h"

long initialize_sd(void);
JSModuleDef *addModule_sd(JSContext *ctx, JSValue global);

#endif
