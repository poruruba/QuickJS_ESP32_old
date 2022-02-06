#ifndef _ENDPOINT_CONFIG_H_
#define _ENDPOINT_CONFIG_H_

#include <Arduino.h>
#if defined(ARDUINO_M5Stick_C)
#include <M5StickC.h>
#elif defined(ARDUINO_M5STACK_Core2)
#include <M5Core2.h>
#endif

#define MDNS_NAME "QuickJS_ESP32" // mDNSサービスホスト名
#define MDNS_SERVICE "quickjs" // mDNSサービスタイプ
#define WIFI_SSID "【WiFiアクセスポイントのSSID】" // WiFiアクセスポイントのSSID
#define WIFI_PASSWORD "【WiFIアクセスポイントのパスワード】" // WiFIアクセスポイントのパスワード

#define UDP_BUFFER_SIZE  1500
#define UDP_JSON_DOCUMENT_SIZE  1500

#define UDP_REQUEST_PORT  3333 //Node.jsサーバからのUDP受信を待ち受けるポート番号
#define UDP_REPORT_PORT   3333 //Node.jsサーバ(UDP)へUDP送信する先のポート番号

#endif
