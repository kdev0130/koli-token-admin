"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/finance/buyOrders/route";
exports.ids = ["app/api/finance/buyOrders/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("net");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffinance%2FbuyOrders%2Froute&page=%2Fapi%2Ffinance%2FbuyOrders%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffinance%2FbuyOrders%2Froute.ts&appDir=%2Fhome%2Fkdev%2Fkoli_ecosystem%2Fkoli-token-admin%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fkdev%2Fkoli_ecosystem%2Fkoli-token-admin&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffinance%2FbuyOrders%2Froute&page=%2Fapi%2Ffinance%2FbuyOrders%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffinance%2FbuyOrders%2Froute.ts&appDir=%2Fhome%2Fkdev%2Fkoli_ecosystem%2Fkoli-token-admin%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fkdev%2Fkoli_ecosystem%2Fkoli-token-admin&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _home_kdev_koli_ecosystem_koli_token_admin_app_api_finance_buyOrders_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/finance/buyOrders/route.ts */ \"(rsc)/./app/api/finance/buyOrders/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/finance/buyOrders/route\",\n        pathname: \"/api/finance/buyOrders\",\n        filename: \"route\",\n        bundlePath: \"app/api/finance/buyOrders/route\"\n    },\n    resolvedPagePath: \"/home/kdev/koli_ecosystem/koli-token-admin/app/api/finance/buyOrders/route.ts\",\n    nextConfigOutput,\n    userland: _home_kdev_koli_ecosystem_koli_token_admin_app_api_finance_buyOrders_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/finance/buyOrders/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZmaW5hbmNlJTJGYnV5T3JkZXJzJTJGcm91dGUmcGFnZT0lMkZhcGklMkZmaW5hbmNlJTJGYnV5T3JkZXJzJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGZmluYW5jZSUyRmJ1eU9yZGVycyUyRnJvdXRlLnRzJmFwcERpcj0lMkZob21lJTJGa2RldiUyRmtvbGlfZWNvc3lzdGVtJTJGa29saS10b2tlbi1hZG1pbiUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGaG9tZSUyRmtkZXYlMkZrb2xpX2Vjb3N5c3RlbSUyRmtvbGktdG9rZW4tYWRtaW4maXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ2M7QUFDNkI7QUFDMUc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDQTtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUM2Sjs7QUFFN0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9rb2xpLWZyb250ZW5kLz9iZDFjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9ob21lL2tkZXYva29saV9lY29zeXN0ZW0va29saS10b2tlbi1hZG1pbi9hcHAvYXBpL2ZpbmFuY2UvYnV5T3JkZXJzL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9maW5hbmNlL2J1eU9yZGVycy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2ZpbmFuY2UvYnV5T3JkZXJzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9maW5hbmNlL2J1eU9yZGVycy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9ob21lL2tkZXYva29saV9lY29zeXN0ZW0va29saS10b2tlbi1hZG1pbi9hcHAvYXBpL2ZpbmFuY2UvYnV5T3JkZXJzL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2ZpbmFuY2UvYnV5T3JkZXJzL3JvdXRlXCI7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHNlcnZlckhvb2tzLFxuICAgICAgICBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCwgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffinance%2FbuyOrders%2Froute&page=%2Fapi%2Ffinance%2FbuyOrders%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffinance%2FbuyOrders%2Froute.ts&appDir=%2Fhome%2Fkdev%2Fkoli_ecosystem%2Fkoli-token-admin%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fkdev%2Fkoli_ecosystem%2Fkoli-token-admin&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/finance/buyOrders/route.ts":
/*!********************************************!*\
  !*** ./app/api/finance/buyOrders/route.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   PUT: () => (/* binding */ PUT)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _utils_db__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/db */ \"(rsc)/./src/utils/db.ts\");\n/* harmony import */ var _utils_realtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/realtime */ \"(rsc)/./src/utils/realtime.ts\");\n\n\n\n\nconst prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_1__.PrismaClient();\nasync function GET(request) {\n    try {\n        await (0,_utils_db__WEBPACK_IMPORTED_MODULE_2__.connectToDatabase)();\n        const userId = request.headers.get(\"x-user-id\");\n        if (!userId) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Unauthorized\"\n            }, {\n                status: 401\n            });\n        }\n        const user = await prisma.user.findUnique({\n            where: {\n                id: userId\n            }\n        });\n        if (!user || user.role !== \"FINANCE\") {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Forbidden\"\n            }, {\n                status: 403\n            });\n        }\n        const { searchParams } = new URL(request.url);\n        const pending = searchParams.get(\"pending\");\n        const where = pending === \"true\" ? {\n            status: \"PENDING\"\n        } : {};\n        const orders = await prisma.buyOrder.findMany({\n            where,\n            include: {\n                user: true\n            },\n            orderBy: {\n                createdAt: \"desc\"\n            }\n        });\n        const serializedOrders = orders.map((o)=>({\n                ...o,\n                amount: Number(o.amount)\n            }));\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            orders: serializedOrders\n        });\n    } catch (error) {\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: error.message\n        }, {\n            status: 500\n        });\n    }\n}\nasync function PUT(request) {\n    try {\n        await (0,_utils_db__WEBPACK_IMPORTED_MODULE_2__.connectToDatabase)();\n        const userId = request.headers.get(\"x-user-id\");\n        if (!userId) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Unauthorized\"\n            }, {\n                status: 401\n            });\n        }\n        const user = await prisma.user.findUnique({\n            where: {\n                id: userId\n            }\n        });\n        if (!user || user.role !== \"FINANCE\") {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Forbidden\"\n            }, {\n                status: 403\n            });\n        }\n        const { orderId, action, reason } = await request.json();\n        if (!orderId || !action) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Missing required fields\"\n            }, {\n                status: 400\n            });\n        }\n        const buyOrder = await prisma.buyOrder.findUnique({\n            where: {\n                id: orderId\n            },\n            include: {\n                user: true\n            }\n        });\n        if (!buyOrder) {\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                error: \"Order not found\"\n            }, {\n                status: 404\n            });\n        }\n        if (action === \"approve\") {\n            const userWallet = await prisma.wallet.findUnique({\n                where: {\n                    userId: buyOrder.userId\n                }\n            });\n            if (!userWallet) {\n                return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                    error: \"User wallet not found\"\n                }, {\n                    status: 404\n                });\n            }\n            const amountInLamports = Number(buyOrder.amount) * 1e9;\n            // Transfer tokens from treasury to user\n            const { transferFromTreasury } = await Promise.all(/*! import() */[__webpack_require__.e(\"vendor-chunks/@solana\"), __webpack_require__.e(\"vendor-chunks/tr46\"), __webpack_require__.e(\"vendor-chunks/@noble\"), __webpack_require__.e(\"vendor-chunks/ws\"), __webpack_require__.e(\"vendor-chunks/bn.js\"), __webpack_require__.e(\"vendor-chunks/bignumber.js\"), __webpack_require__.e(\"vendor-chunks/node-fetch\"), __webpack_require__.e(\"vendor-chunks/whatwg-url\"), __webpack_require__.e(\"vendor-chunks/superstruct\"), __webpack_require__.e(\"vendor-chunks/rpc-websockets\"), __webpack_require__.e(\"vendor-chunks/text-encoding-utf-8\"), __webpack_require__.e(\"vendor-chunks/jayson\"), __webpack_require__.e(\"vendor-chunks/borsh\"), __webpack_require__.e(\"vendor-chunks/eventemitter3\"), __webpack_require__.e(\"vendor-chunks/bindings\"), __webpack_require__.e(\"vendor-chunks/node-gyp-build\"), __webpack_require__.e(\"vendor-chunks/base-x\"), __webpack_require__.e(\"vendor-chunks/webidl-conversions\"), __webpack_require__.e(\"vendor-chunks/uuid\"), __webpack_require__.e(\"vendor-chunks/bigint-buffer\"), __webpack_require__.e(\"vendor-chunks/safe-buffer\"), __webpack_require__.e(\"vendor-chunks/file-uri-to-path\"), __webpack_require__.e(\"vendor-chunks/utf-8-validate\"), __webpack_require__.e(\"vendor-chunks/bufferutil\"), __webpack_require__.e(\"vendor-chunks/bs58\"), __webpack_require__.e(\"_rsc_src_services_tokenService_ts\")]).then(__webpack_require__.bind(__webpack_require__, /*! @/services/tokenService */ \"(rsc)/./src/services/tokenService.ts\"));\n            const result = await transferFromTreasury(userWallet.publicKey, amountInLamports);\n            if (!result.success) {\n                return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                    error: `Transfer failed: ${result.error}`\n                }, {\n                    status: 400\n                });\n            }\n            await prisma.buyOrder.update({\n                where: {\n                    id: orderId\n                },\n                data: {\n                    status: \"APPROVED\",\n                    approvedBy: userId\n                }\n            });\n            await (0,_utils_realtime__WEBPACK_IMPORTED_MODULE_3__.notifyRealtime)(\"finance:update\", {\n                type: \"buyOrder\",\n                id: orderId,\n                action: \"approve\"\n            });\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                success: true,\n                txHash: result.txHash\n            });\n        } else if (action === \"reject\") {\n            await prisma.buyOrder.update({\n                where: {\n                    id: orderId\n                },\n                data: {\n                    status: \"REJECTED\",\n                    approvedBy: userId\n                }\n            });\n            await (0,_utils_realtime__WEBPACK_IMPORTED_MODULE_3__.notifyRealtime)(\"finance:update\", {\n                type: \"buyOrder\",\n                id: orderId,\n                action: \"reject\"\n            });\n            return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n                success: true\n            });\n        }\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: \"Invalid action\"\n        }, {\n            status: 400\n        });\n    } catch (error) {\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            error: error.message\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2ZpbmFuY2UvYnV5T3JkZXJzL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBd0Q7QUFDVjtBQUVDO0FBQ0c7QUFFbEQsTUFBTUksU0FBUyxJQUFJSCx3REFBWUE7QUFFeEIsZUFBZUksSUFBSUMsT0FBb0I7SUFDNUMsSUFBSTtRQUNGLE1BQU1KLDREQUFpQkE7UUFDdkIsTUFBTUssU0FBU0QsUUFBUUUsT0FBTyxDQUFDQyxHQUFHLENBQUM7UUFDbkMsSUFBSSxDQUFDRixRQUFRO1lBQ1gsT0FBT1Asa0ZBQVlBLENBQUNVLElBQUksQ0FBQztnQkFBRUMsT0FBTztZQUFlLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUNwRTtRQUVBLE1BQU1DLE9BQU8sTUFBTVQsT0FBT1MsSUFBSSxDQUFDQyxVQUFVLENBQUM7WUFBRUMsT0FBTztnQkFBRUMsSUFBSVQ7WUFBTztRQUFFO1FBQ2xFLElBQUksQ0FBQ00sUUFBUUEsS0FBS0ksSUFBSSxLQUFLLFdBQVc7WUFDcEMsT0FBT2pCLGtGQUFZQSxDQUFDVSxJQUFJLENBQUM7Z0JBQUVDLE9BQU87WUFBWSxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDakU7UUFFQSxNQUFNLEVBQUVNLFlBQVksRUFBRSxHQUFHLElBQUlDLElBQUliLFFBQVFjLEdBQUc7UUFDNUMsTUFBTUMsVUFBVUgsYUFBYVQsR0FBRyxDQUFDO1FBRWpDLE1BQU1NLFFBQVFNLFlBQVksU0FBUztZQUFFVCxRQUFRO1FBQVUsSUFBSSxDQUFDO1FBRTVELE1BQU1VLFNBQVMsTUFBTWxCLE9BQU9tQixRQUFRLENBQUNDLFFBQVEsQ0FBQztZQUM1Q1Q7WUFDQVUsU0FBUztnQkFBRVosTUFBTTtZQUFLO1lBQ3RCYSxTQUFTO2dCQUFFQyxXQUFXO1lBQU87UUFDL0I7UUFFQSxNQUFNQyxtQkFBbUJOLE9BQU9PLEdBQUcsQ0FBQ0MsQ0FBQUEsSUFBTTtnQkFDeEMsR0FBR0EsQ0FBQztnQkFDSkMsUUFBUUMsT0FBT0YsRUFBRUMs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UVAsT0FBT08sTUFBTTtZQUFDO1FBQ2xFLE9BQU8sSUFBSWIsV0FBVyxVQUFVO1lBQzlCLE1BQU1oQyxPQUFPbUIsUUFBUSxDQUFDc0IsTUFBTSxDQUFDO2dCQUMzQjlCLE9BQU87b0JBQUVDLElBQUltQjtnQkFBUTtnQkFDckJXLE1BQU07b0JBQUVsQyxRQUFRO29CQUFZbUMsWUFBWXhDO2dCQUFPO1lBQ2pEO1lBRUEsTUFBTUosK0RBQWNBLENBQUMsa0JBQWtCO2dCQUFFNkMsTUFBTTtnQkFBWWhDLElBQUltQjtnQkFBU0MsUUFBUTtZQUFTO1lBQ3pGLE9BQU9wQyxrRkFBWUEsQ0FBQ1UsSUFBSSxDQUFDO2dCQUFFa0MsU0FBUztZQUFLO1FBQzNDO1FBRUEsT0FBTzVDLGtGQUFZQSxDQUFDVSxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFpQixHQUFHO1lBQUVDLFFBQVE7UUFBSTtJQUN0RSxFQUFFLE9BQU9ELE9BQVk7UUFDbkIsT0FBT1gsa0ZBQVlBLENBQUNVLElBQUksQ0FBQztZQUFFQyxPQUFPQSxNQUFNc0IsT0FBTztRQUFDLEdBQUc7WUFBRXJCLFFBQVE7UUFBSTtJQUNuRTtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8va29saS1mcm9udGVuZC8uL2FwcC9hcGkvZmluYW5jZS9idXlPcmRlcnMvcm91dGUudHM/MmE5YyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXh0UmVxdWVzdCwgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuaW1wb3J0IHsgUHJpc21hQ2xpZW50IH0gZnJvbSAnQHByaXNtYS9jbGllbnQnO1xuaW1wb3J0IHsgZ2V0VG9rZW5CYWxhbmNlIH0gZnJvbSAnQC9zZXJ2aWNlcy90b2tlblNlcnZpY2UnO1xuaW1wb3J0IHsgY29ubmVjdFRvRGF0YWJhc2UgfSBmcm9tICdAL3V0aWxzL2RiJztcbmltcG9ydCB7IG5vdGlmeVJlYWx0aW1lIH0gZnJvbSAnQC91dGlscy9yZWFsdGltZSc7XG5cbmNvbnN0IHByaXNtYSA9IG5ldyBQcmlzbWFDbGllbnQoKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xuICB0cnkge1xuICAgIGF3YWl0IGNvbm5lY3RUb0RhdGFiYXNlKCk7XG4gICAgY29uc3QgdXNlcklkID0gcmVxdWVzdC5oZWFkZXJzLmdldCgneC11c2VyLWlkJyk7XG4gICAgaWYgKCF1c2VySWQpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHsgd2hlcmU6IHsgaWQ6IHVzZXJJZCB9IH0pO1xuICAgIGlmICghdXNlciB8fCB1c2VyLnJvbGUgIT09ICdGSU5BTkNFJykge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdGb3JiaWRkZW4nIH0sIHsgc3RhdHVzOiA0MDMgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBzZWFyY2hQYXJhbXMgfSA9IG5ldyBVUkwocmVxdWVzdC51cmwpO1xuICAgIGNvbnN0IHBlbmRpbmcgPSBzZWFyY2hQYXJhbXMuZ2V0KCdwZW5kaW5nJyk7XG5cbiAgICBjb25zdCB3aGVyZSA9IHBlbmRpbmcgPT09ICd0cnVlJyA/IHsgc3RhdHVzOiAnUEVORElORycgfSA6IHt9O1xuXG4gICAgY29uc3Qgb3JkZXJzID0gYXdhaXQgcHJpc21hLmJ1eU9yZGVyLmZpbmRNYW55KHtcbiAgICAgIHdoZXJlLFxuICAgICAgaW5jbHVkZTogeyB1c2VyOiB0cnVlIH0sXG4gICAgICBvcmRlckJ5OiB7IGNyZWF0ZWRBdDogJ2Rlc2MnIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBzZXJpYWxpemVkT3JkZXJzID0gb3JkZXJzLm1hcChvID0+ICh7XG4gICAgICAuLi5vLFxuICAgICAgYW1vdW50OiBOdW1iZXIoby5hbW91bnQpXG4gICAgfSkpO1xuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgb3JkZXJzOiBzZXJpYWxpemVkT3JkZXJzIH0pO1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUFVUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgYXdhaXQgY29ubmVjdFRvRGF0YWJhc2UoKTtcbiAgICBjb25zdCB1c2VySWQgPSByZXF1ZXN0LmhlYWRlcnMuZ2V0KCd4LXVzZXItaWQnKTtcbiAgICBpZiAoIXVzZXJJZCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH0sIHsgc3RhdHVzOiA0MDEgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHByaXNtYS51c2VyLmZpbmRVbmlxdWUoeyB3aGVyZTogeyBpZDogdXNlcklkIH0gfSk7XG4gICAgaWYgKCF1c2VyIHx8IHVzZXIucm9sZSAhPT0gJ0ZJTkFOQ0UnKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ZvcmJpZGRlbicgfSwgeyBzdGF0dXM6IDQwMyB9KTtcbiAgICB9XG5cbiAgICBjb25zdCB7IG9yZGVySWQsIGFjdGlvbiwgcmVhc29uIH0gPSBhd2FpdCByZXF1ZXN0Lmpzb24oKTtcblxuICAgIGlmICghb3JkZXJJZCB8fCAhYWN0aW9uKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgZmllbGRzJyB9LCB7IHN0YXR1czogNDAwIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1eU9yZGVyID0gYXdhaXQgcHJpc21hLmJ1eU9yZGVyLmZpbmRVbmlxdWUoeyBcbiAgICAgIHdoZXJlOiB7IGlkOiBvcmRlcklkIH0sXG4gICAgICBpbmNsdWRlOiB7IHVzZXI6IHRydWUgfVxuICAgIH0pO1xuICAgIFxuICAgIGlmICghYnV5T3JkZXIpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnT3JkZXIgbm90IGZvdW5kJyB9LCB7IHN0YXR1czogNDA0IH0pO1xuICAgIH1cblxuICAgIGlmIChhY3Rpb24gPT09ICdhcHByb3ZlJykge1xuICAgICAgY29uc3QgdXNlcldhbGxldCA9IGF3YWl0IHByaXNtYS53YWxsZXQuZmluZFVuaXF1ZSh7IFxuICAgICAgICB3aGVyZTogeyB1c2VySWQ6IGJ1eU9yZGVyLnVzZXJJZCB9XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgaWYgKCF1c2VyV2FsbGV0KSB7XG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVXNlciB3YWxsZXQgbm90IGZvdW5kJyB9LCB7IHN0YXR1czogNDA0IH0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhbW91bnRJbkxhbXBvcnRzID0gTnVtYmVyKGJ1eU9yZGVyLmFtb3VudCkgKiAxZTk7XG5cbiAgICAgIC8vIFRyYW5zZmVyIHRva2VucyBmcm9tIHRyZWFzdXJ5IHRvIHVzZXJcbiAgICAgIGNvbnN0IHsgdHJhbnNmZXJGcm9tVHJlYXN1cnkgfSA9IGF3YWl0IGltcG9ydCgnQC9zZXJ2aWNlcy90b2tlblNlcnZpY2UnKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRyYW5zZmVyRnJvbVRyZWFzdXJ5KHVzZXJXYWxsZXQucHVibGljS2V5LCBhbW91bnRJbkxhbXBvcnRzKTtcblxuICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogYFRyYW5zZmVyIGZhaWxlZDogJHtyZXN1bHQuZXJyb3J9YCB9LCB7IHN0YXR1czogNDAwIH0pO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBwcmlzbWEuYnV5T3JkZXIudXBkYXRlKHtcbiAgICAgICAgd2hlcmU6IHsgaWQ6IG9yZGVySWQgfSxcbiAgICAgICAgZGF0YTogeyBzdGF0dXM6ICdBUFBST1ZFRCcsIGFwcHJvdmVkQnk6IHVzZXJJZCB9LFxuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5vdGlmeVJlYWx0aW1lKCdmaW5hbmNlOnVwZGF0ZScsIHsgdHlwZTogJ2J1eU9yZGVyJywgaWQ6IG9yZGVySWQsIGFjdGlvbjogJ2FwcHJvdmUnIH0pO1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogdHJ1ZSwgdHhIYXNoOiByZXN1bHQudHhIYXNoIH0pO1xuICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAncmVqZWN0Jykge1xuICAgICAgYXdhaXQgcHJpc21hLmJ1eU9yZGVyLnVwZGF0ZSh7XG4gICAgICAgIHdoZXJlOiB7IGlkOiBvcmRlcklkIH0sXG4gICAgICAgIGRhdGE6IHsgc3RhdHVzOiAnUkVKRUNURUQnLCBhcHByb3ZlZEJ5OiB1c2VySWQgfSxcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBub3RpZnlSZWFsdGltZSgnZmluYW5jZTp1cGRhdGUnLCB7IHR5cGU6ICdidXlPcmRlcicsIGlkOiBvcmRlcklkLCBhY3Rpb246ICdyZWplY3QnIH0pO1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogdHJ1ZSB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ludmFsaWQgYWN0aW9uJyB9LCB7IHN0YXR1czogNDAwIH0pO1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSwgeyBzdGF0dXM6IDUwMCB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsIlByaXNtYUNsaWVudCIsImNvbm5lY3RUb0RhdGFiYXNlIiwibm90aWZ5UmVhbHRpbWUiLCJwcmlzbWEiLCJHRVQiLCJyZXF1ZXN0IiwidXNlcklkIiwiaGVhZGVycyIsImdldCIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsInVzZXIiLCJmaW5kVW5pcXVlIiwid2hlcmUiLCJpZCIsInJvbGUiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJ1cmwiLCJwZW5kaW5nIiwib3JkZXJzIiwiYnV5T3JkZXIiLCJmaW5kTWFueSIsImluY2x1ZGUiLCJvcmRlckJ5IiwiY3JlYXRlZEF0Iiwic2VyaWFsaXplZE9yZGVycyIsIm1hcCIsIm8iLCJhbW91bnQiLCJOdW1iZXIiLCJtZXNzYWdlIiwiUFVUIiwib3JkZXJJZCIsImFjdGlvbiIsInJlYXNvbiIsInVzZXJXYWxsZXQiLCJ3YWxsZXQiLCJhbW91bnRJbkxhbXBvcnRzIiwidHJhbnNmZXJGcm9tVHJlYXN1cnkiLCJyZXN1bHQiLCJwdWJsaWNLZXkiLCJzdWNjZXNzIiwidXBkYXRlIiwiZGF0YSIsImFwcHJvdmVkQnkiLCJ0eXBlIiwidHhIYXNoIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/finance/buyOrders/route.ts\n");

/***/ }),

/***/ "(rsc)/./src/utils/db.ts":
/*!*************************!*\
  !*** ./src/utils/db.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   connectToDatabase: () => (/* binding */ connectToDatabase),\n/* harmony export */   prisma: () => (/* binding */ prisma)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst globalForPrisma = globalThis;\nconst prisma = globalForPrisma.prisma || new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) globalForPrisma.prisma = prisma;\nasync function connectToDatabase() {\n    try {\n        await prisma.$connect();\n    } catch (error) {\n        console.error(\"Database connection error:\", error);\n        throw error;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvdXRpbHMvZGIudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUE4QztBQUU5QyxNQUFNQyxrQkFBa0JDO0FBRWpCLE1BQU1DLFNBQVNGLGdCQUFnQkUsTUFBTSxJQUFJLElBQUlILHdEQUFZQSxHQUFHO0FBRW5FLElBQUlJLElBQXlCLEVBQWNILGdCQUFnQkUsTUFBTSxHQUFHQTtBQUU3RCxlQUFlRTtJQUNwQixJQUFJO1FBQ0YsTUFBTUYsT0FBT0csUUFBUTtJQUN2QixFQUFFLE9BQU9DLE9BQU87UUFDZEMsUUFBUUQsS0FBSyxDQUFDLDhCQUE4QkE7UUFDNUMsTUFBTUE7SUFDUjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8va29saS1mcm9udGVuZC8uL3NyYy91dGlscy9kYi50cz85ZGIwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gJ0BwcmlzbWEvY2xpZW50JztcblxuY29uc3QgZ2xvYmFsRm9yUHJpc21hID0gZ2xvYmFsVGhpcyBhcyB1bmtub3duIGFzIHsgcHJpc21hOiBQcmlzbWFDbGllbnQgfTtcblxuZXhwb3J0IGNvbnN0IHByaXNtYSA9IGdsb2JhbEZvclByaXNtYS5wcmlzbWEgfHwgbmV3IFByaXNtYUNsaWVudCgpO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgZ2xvYmFsRm9yUHJpc21hLnByaXNtYSA9IHByaXNtYTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbm5lY3RUb0RhdGFiYXNlKCkge1xuICB0cnkge1xuICAgIGF3YWl0IHByaXNtYS4kY29ubmVjdCgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0RhdGFiYXNlIGNvbm5lY3Rpb24gZXJyb3I6JywgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG4iXSwibmFtZXMiOlsiUHJpc21hQ2xpZW50IiwiZ2xvYmFsRm9yUHJpc21hIiwiZ2xvYmFsVGhpcyIsInByaXNtYSIsInByb2Nlc3MiLCJjb25uZWN0VG9EYXRhYmFzZSIsIiRjb25uZWN0IiwiZXJyb3IiLCJjb25zb2xlIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/utils/db.ts\n");

/***/ }),

/***/ "(rsc)/./src/utils/realtime.ts":
/*!*******************************!*\
  !*** ./src/utils/realtime.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   notifyRealtime: () => (/* binding */ notifyRealtime)\n/* harmony export */ });\nasync function notifyRealtime(event, payload) {\n    const baseUrl = process.env.REALTIME_SERVER_URL;\n    if (!baseUrl) return;\n    try {\n        await fetch(`${baseUrl}/broadcast`, {\n            method: \"POST\",\n            headers: {\n                \"Content-Type\": \"application/json\"\n            },\n            body: JSON.stringify({\n                event,\n                payload: payload ?? {}\n            })\n        });\n    } catch  {\n    // ignore realtime errors\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvdXRpbHMvcmVhbHRpbWUudHMiLCJtYXBwaW5ncyI6Ijs7OztBQUFPLGVBQWVBLGVBQWVDLEtBQWEsRUFBRUMsT0FBaUM7SUFDbkYsTUFBTUMsVUFBVUMsUUFBUUMsR0FBRyxDQUFDQyxtQkFBbUI7SUFDL0MsSUFBSSxDQUFDSCxTQUFTO0lBRWQsSUFBSTtRQUNGLE1BQU1JLE1BQU0sQ0FBQyxFQUFFSixRQUFRLFVBQVUsQ0FBQyxFQUFFO1lBQ2xDSyxRQUFRO1lBQ1JDLFNBQVM7Z0JBQUUsZ0JBQWdCO1lBQW1CO1lBQzlDQyxNQUFNQyxLQUFLQyxTQUFTLENBQUM7Z0JBQUVYO2dCQUFPQyxTQUFTQSxXQUFXLENBQUM7WUFBRTtRQUN2RDtJQUNGLEVBQUUsT0FBTTtJQUNOLHlCQUF5QjtJQUMzQjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8va29saS1mcm9udGVuZC8uL3NyYy91dGlscy9yZWFsdGltZS50cz9kMTQzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBhc3luYyBmdW5jdGlvbiBub3RpZnlSZWFsdGltZShldmVudDogc3RyaW5nLCBwYXlsb2FkPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pIHtcbiAgY29uc3QgYmFzZVVybCA9IHByb2Nlc3MuZW52LlJFQUxUSU1FX1NFUlZFUl9VUkw7XG4gIGlmICghYmFzZVVybCkgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgZmV0Y2goYCR7YmFzZVVybH0vYnJvYWRjYXN0YCwge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgZXZlbnQsIHBheWxvYWQ6IHBheWxvYWQgPz8ge30gfSksXG4gICAgfSk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIGlnbm9yZSByZWFsdGltZSBlcnJvcnNcbiAgfVxufVxuIl0sIm5hbWVzIjpbIm5vdGlmeVJlYWx0aW1lIiwiZXZlbnQiLCJwYXlsb2FkIiwiYmFzZVVybCIsInByb2Nlc3MiLCJlbnYiLCJSRUFMVElNRV9TRVJWRVJfVVJMIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./src/utils/realtime.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Ffinance%2FbuyOrders%2Froute&page=%2Fapi%2Ffinance%2FbuyOrders%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Ffinance%2FbuyOrders%2Froute.ts&appDir=%2Fhome%2Fkdev%2Fkoli_ecosystem%2Fkoli-token-admin%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2Fhome%2Fkdev%2Fkoli_ecosystem%2Fkoli-token-admin&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();