#ifndef _MODULE_CONFIG_H_
#define _MODULE_CONFIG_H_

#include <Arduino.h>
#if defined(ARDUINO_M5Stick_C)
#include <M5StickC.h>
#elif defined(ARDUINO_M5STACK_Core2)
#include <M5Core2.h>
#endif

//#define _LOGIO_ENABLE_
#define _LCD_ENABLE_
#define _RTC_ENABLE_
#define _IMU_ENABLE_
#define _MQTT_ENABLE_
#if defined(ARDUINO_M5STACK_Core2)
#define _SD_ENABLE_
#endif

#ifdef _LOGIO_ENABLE_
#define LOGIO_HOST  "【log.ioのホスト名】" // log.ioのホスト名
#define LOGIO_PORT  6689 // log.ioのポート番号
#endif

#define JSCODE_BUFFER_SIZE 10000
#define JSMODULE_BUFFER_SIZE 20000

#define jscode_base_url "http://【Node.jsサーバのホスト名】/quickjs_public"  // モジュールJson/Javascritpの取得先基準URL
#define jscode_modules_url  "http://【Node.jsサーバのホスト名】/quickjs_public/modules.json" // モジュールJsonの取得先URL
#define jscode_main_url "http://【Node.jsサーバのホスト名】/quickjs_public/main.js"        // Javascriptの取得先URL
#define MQTT_BROKER_URL "【Node.jsサーバのホスト名】"  // MQTTブローカのホスト名
#define MQTT_BROKER_PORT  1883 // MQTTブローカのポート番号(TCP接続)
#define HTTPPROXY_URL "http://【Node.jsサーバのホスト名】/httpproxy-call" // 中継サーバのURL

#endif
