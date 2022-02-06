#ifndef _MODULE_IMU_H_
#define _MODULE_IMU_H_

#include "quickjs.h"

long initialize_imu(void);
JSModuleDef *addModule_imu(JSContext *ctx, JSValue global);

#endif
