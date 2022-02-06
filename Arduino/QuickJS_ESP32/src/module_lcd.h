#ifndef _MODULE_LCD_H_
#define _MODULE_LCD_H_

#include "quickjs.h"

long initialize_lcd(void);
JSModuleDef *addModule_lcd(JSContext *ctx, JSValue global);

#endif
