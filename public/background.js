!function(t){var e={};function n(i){if(e[i])return e[i].exports;var r=e[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(i,r,function(e){return t[e]}.bind(null,r));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=57)}({56:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getStorageAll=e.setStorage=e.getStorage=void 0;e.getStorage=(t,e)=>{const n="settings"===t?chrome.storage.sync:chrome.storage.local;let i=new Promise(e=>{n.get(t,t=>e(t))});return e?i.then(e):i};e.setStorage=(t,e,n)=>{const i="settings"===t?chrome.storage.sync:chrome.storage.local;let r=new Promise(n=>{i.set(e,()=>{i.get(t,t=>n(t))})});return n?r.then(n):r};e.getStorageAll=(t,e)=>{const n=t.map(t=>({key:t,storage:chrome.storage["settings"===t?"sync":"local"]}));let i=Promise.all(n.map(t=>{const{storage:e,key:n}=t;return new Promise(t=>{e.get(n,e=>t(e))})})).then(e=>{const n={};return e.forEach((e,i)=>n[t[i]]=e[t[i]]),n});return e?i.then(e):i}},57:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.RedirectEnum=void 0;const i=n(56);var r;!function(t){t.URL="URL",t.BLANK="BLANK",t.DEFAULT="DEFAULT",t.ENCOURAGING="ENCOURAGING",t.OFFENSIVE="OFFENSIVE",t.CUSTOM="CUSTOM"}(r=e.RedirectEnum||(e.RedirectEnum={})),(0,i.getStorageAll)(["settings"]).then(t=>{!function(t,e){let n=t.settings||{},{isBlocking:o,siteList:s,isWhiteListing:c,whiteListSites:a,redirectLink:u,redirectOption:l}=n;o=Boolean(o),c=Boolean(c),s=void 0===s?[]:s,a=void 0===a?[]:a,u=u||"",l=l||r.DEFAULT;const g={isBlocking:o,siteList:s,isWhiteListing:c,whiteListSites:a,redirectLink:u,redirectOption:l};let d={};(0,i.setStorage)("settings",{settings:g}).then(t=>{d=Object.assign(d,t),e(d)})}(t,t=>{const{isBlocking:e,isWhiteListing:n,siteList:i,whiteListSites:r,redirectLink:s,redirectOption:c}=t.settings;(e||n)&&chrome.tabs.query({},(function(t){const e=n?r:i;Array.from(t).forEach(t=>{o(t.id,t.url,e,n,s,c)})}))})}),chrome.tabs.onUpdated.addListener((function(t,e){(0,i.getStorage)("settings",(function(n){const{isBlocking:i,isWhiteListing:r,siteList:s,whiteListSites:c,redirectLink:a,redirectOption:u}=n.settings;if((i||r)&&e.url){const n=r?c:s;o(t,e.url,n,r,a,u)}}))})),chrome.storage.onChanged.addListener((function(t,e){if(t.settings){const{oldValue:e,newValue:n}=t.settings;if(e&&n){const{isBlocking:t,siteList:e,isWhiteListing:i,whiteListSites:r,redirectLink:s,redirectOption:c}=n;(t||i)&&chrome.tabs.query({},(function(t){const n=i?r:e;Array.from(t).forEach(t=>{o(t.id,t.url,n,i,s,c)})}))}}}));function o(t,e,n,i=!1,o,s){if((t=>["chrome-extension://","chrome:"].some(e=>0===t.indexOf(e)))(e))return;const c=n.find(t=>0===e.indexOf("https://"+t)||0===e.indexOf("http://"+t));if(c&&!i||!c&&i){const e=s===r.URL&&o?"https://"+o:"not_available/not_available.html";chrome.tabs.update(t,{url:e})}}}});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbW9kdWxlcy9zdG9yYWdlLnRzIiwid2VicGFjazovLy8uL2JhY2tncm91bmQvaW5kZXgudHMiXSwibmFtZXMiOlsiaW5zdGFsbGVkTW9kdWxlcyIsIl9fd2VicGFja19yZXF1aXJlX18iLCJtb2R1bGVJZCIsImV4cG9ydHMiLCJtb2R1bGUiLCJpIiwibCIsIm1vZHVsZXMiLCJjYWxsIiwibSIsImMiLCJkIiwibmFtZSIsImdldHRlciIsIm8iLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImVudW1lcmFibGUiLCJnZXQiLCJyIiwiU3ltYm9sIiwidG9TdHJpbmdUYWciLCJ2YWx1ZSIsInQiLCJtb2RlIiwiX19lc01vZHVsZSIsIm5zIiwiY3JlYXRlIiwia2V5IiwiYmluZCIsIm4iLCJvYmplY3QiLCJwcm9wZXJ0eSIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwicCIsInMiLCJnZXRTdG9yYWdlIiwiY2FsbGJhY2siLCJzdG9yYWdlIiwiY2hyb21lIiwic3luYyIsImxvY2FsIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiZGF0YSIsInRoZW4iLCJzZXRTdG9yYWdlIiwic2V0IiwiZ2V0U3RvcmFnZUFsbCIsImtleXMiLCJzdG9yYWdlc0tleXMiLCJtYXAiLCJhbGwiLCJzdG9yYWdlS2V5IiwicmVzIiwiZm9yRWFjaCIsIml0ZW0iLCJpZHgiLCJSZWRpcmVjdEVudW0iLCJwcmV2U2V0dGluZ3MiLCJzZXR0aW5ncyIsImlzQmxvY2tpbmciLCJzaXRlTGlzdCIsImlzV2hpdGVMaXN0aW5nIiwid2hpdGVMaXN0U2l0ZXMiLCJyZWRpcmVjdExpbmsiLCJyZWRpcmVjdE9wdGlvbiIsIkJvb2xlYW4iLCJ1bmRlZmluZWQiLCJERUZBVUxUIiwibmV3RGF0YSIsImFzc2lnbiIsImVuc3VyZVNldHRpbmdzIiwidGFicyIsInF1ZXJ5Iiwic2l0ZXMiLCJBcnJheSIsImZyb20iLCJ0YWIiLCJibG9ja1NpdGVzIiwiaWQiLCJ1cmwiLCJvblVwZGF0ZWQiLCJhZGRMaXN0ZW5lciIsInRhYklkIiwiY2hhbmdlSW5mbyIsIm9uQ2hhbmdlZCIsImNoYW5nZXMiLCJuYW1lc3BhY2UiLCJvbGRWYWx1ZSIsIm5ld1ZhbHVlIiwibklzQmxvY2tpbmciLCJuU2l0ZUxpc3QiLCJuSXNXaGl0ZUxpc3RpbmciLCJuV2hpdGVMaXN0U2l0ZXMiLCJpc1doaXRlbGlzdCIsInNvbWUiLCJzaXRlIiwiaW5kZXhPZiIsImlnbm9yZVNpdGUiLCJpc0luTGlzdCIsImZpbmQiLCJVUkwiLCJ1cGRhdGUiXSwibWFwcGluZ3MiOiJhQUNFLElBQUlBLEVBQW1CLEdBR3ZCLFNBQVNDLEVBQW9CQyxHQUc1QixHQUFHRixFQUFpQkUsR0FDbkIsT0FBT0YsRUFBaUJFLEdBQVVDLFFBR25DLElBQUlDLEVBQVNKLEVBQWlCRSxHQUFZLENBQ3pDRyxFQUFHSCxFQUNISSxHQUFHLEVBQ0hILFFBQVMsSUFVVixPQU5BSSxFQUFRTCxHQUFVTSxLQUFLSixFQUFPRCxRQUFTQyxFQUFRQSxFQUFPRCxRQUFTRixHQUcvREcsRUFBT0UsR0FBSSxFQUdKRixFQUFPRCxRQUtmRixFQUFvQlEsRUFBSUYsRUFHeEJOLEVBQW9CUyxFQUFJVixFQUd4QkMsRUFBb0JVLEVBQUksU0FBU1IsRUFBU1MsRUFBTUMsR0FDM0NaLEVBQW9CYSxFQUFFWCxFQUFTUyxJQUNsQ0csT0FBT0MsZUFBZWIsRUFBU1MsRUFBTSxDQUFFSyxZQUFZLEVBQU1DLElBQUtMLEtBS2hFWixFQUFvQmtCLEVBQUksU0FBU2hCLEdBQ1gsb0JBQVhpQixRQUEwQkEsT0FBT0MsYUFDMUNOLE9BQU9DLGVBQWViLEVBQVNpQixPQUFPQyxZQUFhLENBQUVDLE1BQU8sV0FFN0RQLE9BQU9DLGVBQWViLEVBQVMsYUFBYyxDQUFFbUIsT0FBTyxLQVF2RHJCLEVBQW9Cc0IsRUFBSSxTQUFTRCxFQUFPRSxHQUV2QyxHQURVLEVBQVBBLElBQVVGLEVBQVFyQixFQUFvQnFCLElB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QixTQUFVOEIsRUFDVjdCLGVBQWdCOEIsRUFDaEI3QixlQUFnQjhCLEVBQWUsYUFDL0I3QixFQUFZLGVBQ1pDLEdBQ0V3QixHQUVpQkMsR0FBZUUsSUFFbEN2RCxPQUFPbUMsS0FBS0MsTUFBTSxJQUFJLFNBQVVELEdBQzlCLE1BQU1YLEVBQVcrQixFQUFrQkMsRUFBa0JGLEVBQ3JEaEIsTUFBTUMsS0FBS0osR0FBTWxCLFFBQVN1QixJQUN4QkMsRUFBV0QsRUFBSUUsR0FBSUYsRUFBSUcsSUFBS25CLEVBQVUrQixFQUFpQjVCLEVBQWNDLGFBY2pGLFNBQVNhLEVBQ1BLLEVBQ0FILEVBQ0FuQixFQUNBaUMsR0FBYyxFQUNkOUIsRUFDQUMsR0FFQSxHQWJpQixDQUFDZSxHQUNFLENBQUMsc0JBQXVCLFdBQ3pCZSxLQUFNQyxHQUErQixJQUF0QmhCLEVBQUlpQixRQUFRRCxJQVcxQ0UsQ0FBV2xCLEdBQU0sT0FDckIsTUFBTW1CLEVBQVd0QyxFQUFTdUMsS0FBTUosR0FDWSxJQUFuQ2hCLEVBQUlpQixRQUFRLFdBQWFELElBQWlELElBQWxDaEIsRUFBSWlCLFFBQVEsVUFBWUQsSUFHekUsR0FEeUJHLElBQWFMLElBQWtCSyxHQUFZTCxFQUMvQyxDQUVuQixNQUFNZCxFQUNKZixJQUFtQlIsRUFBYTRDLEtBQU9yQyxFQUNuQyxXQUFhQSxFQUNiLG1DQUNOM0IsT0FBT21DLEtBQUs4QixPQUFPbkIsRUFBTyxDQUFFSCIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDU3KTtcbiIsImV4cG9ydCBjb25zdCBnZXRTdG9yYWdlID0gKGtleTogc3RyaW5nLCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlID0ga2V5ID09PSBcInNldHRpbmdzXCIgPyBjaHJvbWUuc3RvcmFnZS5zeW5jIDogY2hyb21lLnN0b3JhZ2UubG9jYWw7XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzdG9yYWdlLmdldChrZXksIChkYXRhKSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFN0b3JhZ2UgPSAoa2V5OiBzdHJpbmcsIG9iamVjdDogYW55LCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlID0ga2V5ID09PSBcInNldHRpbmdzXCIgPyBjaHJvbWUuc3RvcmFnZS5zeW5jIDogY2hyb21lLnN0b3JhZ2UubG9jYWw7XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzdG9yYWdlLnNldChvYmplY3QsICgpID0+IHtcbiAgICAgIHN0b3JhZ2UuZ2V0KGtleSwgKGRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2VBbGwgPSAoa2V5czogYW55LCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlc0tleXMgPSBrZXlzLm1hcCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4geyBrZXksIHN0b3JhZ2U6IGNocm9tZS5zdG9yYWdlW2tleSA9PT0gXCJzZXR0aW5nc1wiID8gXCJzeW5jXCIgOiBcImxvY2FsXCJdIH07XG4gIH0pO1xuICBsZXQgcHJvbWlzZSA9IFByb21pc2UuYWxsKFxuICAgIHN0b3JhZ2VzS2V5cy5tYXAoKHN0b3JhZ2VLZXk6IGFueSkgPT4ge1xuICAgICAgY29uc3QgeyBzdG9yYWdlLCBrZXkgfSA9IHN0b3JhZ2VLZXk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc3RvcmFnZS5nZXQoa2V5LCAoZGF0YTogYW55KSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICkudGhlbigocmVzKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IHt9IGFzIGFueTtcbiAgICByZXMuZm9yRWFjaCgoaXRlbSwgaWR4KSA9PiAoZGF0YVtrZXlzW2lkeF1dID0gaXRlbVtrZXlzW2lkeF1dKSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH0pO1xuICByZXR1cm4gY2FsbGJhY2sgPyBwcm9taXNlLnRoZW4oY2FsbGJhY2spIDogcHJvbWlzZTtcbn07XG4iLCJpbXBvcnQgeyBnZXRTdG9yYWdlLCBzZXRTdG9yYWdlLCBnZXRTdG9yYWdlQWxsIH0gZnJvbSBcIi4uL21vZHVsZXMvc3RvcmFnZVwiO1xuXG5leHBvcnQgZW51bSBSZWRpcmVjdEVudW0ge1xuICBVUkwgPSBcIlVSTFwiLFxuICBCTEFOSyA9IFwiQkxBTktcIixcbiAgREVGQVVMVCA9IFwiREVGQVVMVFwiLFxuICBFTkNPVVJBR0lORyA9IFwiRU5DT1VSQUdJTkdcIixcbiAgT0ZGRU5TSVZFID0gXCJPRkZFTlNJVkVcIixcbiAgQ1VTVE9NID0gXCJDVVNUT01cIixcbn1cblxuZXhwb3J0IHR5cGUgVGlwID0ge1xuICB0aXRsZTogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUaXBTZXR0aW5ncyA9IHtcbiAgdGlwczogVGlwW107XG4gIHRoZW1lOiB7XG4gICAgY29sb3I6IHtcbiAgICAgIGJhY2tncm91bmRTdGFydDogc3RyaW5nO1xuICAgICAgYmFja2dyb3VuZEVuZDogc3RyaW5nO1xuICAgICAgZm9udEZhbWlseTogc3RyaW5nO1xuICAgICAgZm9udENvbG9yOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbn07XG5cbmV4cG9ydCB0eXBlIFNldHRpbmdzID0ge1xuICBpc0Jsb2NraW5nPzogYm9vbGVhbjtcbiAgaXNXaGl0ZUxpc3Rpbmc/OiBib29sZWFuO1xuICBzaXRlTGlzdD86IHN0cmluZ1tdO1xuICB3aGl0ZUxpc3RTaXRlcz86IHN0cmluZ1tdO1xuICByZWRpcmVjdExpbms/OiBzdHJpbmc7XG4gIHJlZGlyZWN0T3B0aW9uPzogUmVkaXJlY3RFbnVtO1xuICB0aXBTZXR0aW5ncz86IFRpcFNldHRpbmdzO1xufTtcblxuKGZ1bmN0aW9uICgpIHtcbiAgZ2V0U3RvcmFnZUFsbChbXCJzZXR0aW5nc1wiXSkudGhlbigoZGF0YSkgPT4ge1xuICAgIGVuc3VyZVNldHRpbmdzKGRhdGEsIChuZXdEYXRhOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHsgaXNCbG9ja2luZywgaXNXaGl0ZUxpc3RpbmcsIHNpdGVMaXN0LCB3aGl0ZUxpc3RTaXRlcywgcmVkaXJlY3RMaW5rLCByZWRpcmVjdE9wdGlvbiB9ID1cbiAgICAgICAgbmV3RGF0YS5zZXR0aW5ncyBhcyBTZXR0aW5ncztcbiAgICAgIGlmIChpc0Jsb2NraW5nIHx8IGlzV2hpdGVMaXN0aW5nKSB7XG4gICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCBmdW5jdGlvbiAodGFicykge1xuICAgICAgICAgIGNvbnN0IHNpdGVzID0gaXNXaGl0ZUxpc3RpbmcgPyB3aGl0ZUxpc3RTaXRlcyA6IHNpdGVMaXN0O1xuICAgICAgICAgIEFycmF5LmZyb20odGFicykuZm9yRWFjaCgodGFiKSA9PiB7XG4gICAgICAgICAgICBibG9ja1NpdGVzKHRhYi5pZCwgdGFiLnVybCwgc2l0ZXMsIGlzV2hpdGVMaXN0aW5nLCByZWRpcmVjdExpbmssIHJlZGlyZWN0T3B0aW9uKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSkoKTtcblxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uICh0YWJJZCwgY2hhbmdlSW5mbykge1xuICBnZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwgZnVuY3Rpb24gKGRhdGE6IGFueSkge1xuICAgIGNvbnN0IHsgaXNCbG9ja2luZywgaXNXaGl0ZUxpc3RpbmcsIHNpdGVMaXN0LCB3aGl0ZUxpc3RTaXRlcywgcmVkaXJlY3RMaW5rLCByZWRpcmVjdE9wdGlvbiB9ID1cbiAgICAgIGRhdGEuc2V0dGluZ3M7XG4gICAgaWYgKChpc0Jsb2NraW5nIHx8IGlzV2hpdGVMaXN0aW5nKSAmJiBjaGFuZ2VJbmZvLnVybCkge1xuICAgICAgY29uc3Qgc2l0ZXMgPSBpc1doaXRlTGlzdGluZyA/IHdoaXRlTGlzdFNpdGVzIDogc2l0ZUxpc3Q7XG4gICAgICBibG9ja1NpdGVzKHRhYklkLCBjaGFuZ2VJbmZvLnVybCwgc2l0ZXMsIGlzV2hpdGVMaXN0aW5nLCByZWRpcmVjdExpbmssIHJlZGlyZWN0T3B0aW9uKTtcbiAgICB9XG4gIH0pO1xufSk7XG5cbmNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoY2hhbmdlcywgbmFtZXNwYWNlKSB7XG4gIGlmIChjaGFuZ2VzLnNldHRpbmdzKSB7XG4gICAgY29uc3QgeyBvbGRWYWx1ZSwgbmV3VmFsdWUgfSA9IGNoYW5nZXMuc2V0dGluZ3M7XG4gICAgaWYgKG9sZFZhbHVlICYmIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzQmxvY2tpbmc6IG5Jc0Jsb2NraW5nLFxuICAgICAgICBzaXRlTGlzdDogblNpdGVMaXN0LFxuICAgICAgICBpc1doaXRlTGlzdGluZzogbklzV2hpdGVMaXN0aW5nLFxuICAgICAgICB3aGl0ZUxpc3RTaXRlczogbldoaXRlTGlzdFNpdGVzLFxuICAgICAgICByZWRpcmVjdExpbmssXG4gICAgICAgIHJlZGlyZWN0T3B0aW9uLFxuICAgICAgfSA9IG5ld1ZhbHVlO1xuICAgICAgLy8gVE9ETyBpbiBmdXR1cmUgY2FuIG1ha2UgaXQgcG9zc2libGUgdG8gdHVybiBvZmYgYmxvY2sgc2l0ZXMgYW5kIHRoZW4gYW55IHBhZ2Ugd291bGQgZ28gYmFjayB0byB3aGF0IHdhcyBvcmlnaW5hbGx5IHNlYXJjaGVkIChpZiBJIHNhdmUgc2VhcmNoZWQgdmlkIHBlciB0YWIgcHJpb3IgdG8gYmxvY2tpbmcgc2FpZCBwYWdlKVxuICAgICAgY29uc3QgYmxvY2tFbmFibGVkID0gbklzQmxvY2tpbmcgfHwgbklzV2hpdGVMaXN0aW5nO1xuICAgICAgaWYgKGJsb2NrRW5hYmxlZCkge1xuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgZnVuY3Rpb24gKHRhYnMpIHtcbiAgICAgICAgICBjb25zdCBzaXRlTGlzdCA9IG5Jc1doaXRlTGlzdGluZyA/IG5XaGl0ZUxpc3RTaXRlcyA6IG5TaXRlTGlzdDtcbiAgICAgICAgICBBcnJheS5mcm9tKHRhYnMpLmZvckVhY2goKHRhYikgPT4ge1xuICAgICAgICAgICAgYmxvY2tTaXRlcyh0YWIuaWQsIHRhYi51cmwsIHNpdGVMaXN0LCBuSXNXaGl0ZUxpc3RpbmcsIHJlZGlyZWN0TGluaywgcmVkaXJlY3RPcHRpb24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG4vLyBuZXZlciBibG9jayBzaXRlcyB3aXRoIHRoZXNlIHRlcm1zXG5jb25zdCBpZ25vcmVTaXRlID0gKHVybDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGlnbm9yZVNpdGVzID0gW1wiY2hyb21lLWV4dGVuc2lvbjovL1wiLCBcImNocm9tZTpcIl07XG4gIHJldHVybiBpZ25vcmVTaXRlcy5zb21lKChzaXRlKSA9PiB1cmwuaW5kZXhPZihzaXRlKSA9PT0gMCk7XG59O1xuXG5mdW5jdGlvbiBibG9ja1NpdGVzKFxuICB0YWJJZDogYW55LFxuICB1cmw6IHN0cmluZyxcbiAgc2l0ZUxpc3Q6IHN0cmluZ1tdLFxuICBpc1doaXRlbGlzdCA9IGZhbHNlLFxuICByZWRpcmVjdExpbms6IHN0cmluZyxcbiAgcmVkaXJlY3RPcHRpb246IFJlZGlyZWN0RW51bVxuKSB7XG4gIGlmIChpZ25vcmVTaXRlKHVybCkpIHJldHVybjtcbiAgY29uc3QgaXNJbkxpc3QgPSBzaXRlTGlzdC5maW5kKChzaXRlKSA9PiB7XG4gICAgcmV0dXJuIHVybC5pbmRleE9mKFwiaHR0cHM6Ly9cIiArIHNpdGUpID09PSAwIHx8IHVybC5pbmRleE9mKFwiaHR0cDovL1wiICsgc2l0ZSkgPT09IDA7XG4gIH0pO1xuICBjb25zdCBzaG91bGRCZUJsb2NrZWQgPSAoaXNJbkxpc3QgJiYgIWlzV2hpdGVsaXN0KSB8fCAoIWlzSW5MaXN0ICYmIGlzV2hpdGVsaXN0KTtcbiAgaWYgKHNob3VsZEJlQmxvY2tlZCkge1xuICAgIC8vIGNhbiBJIHB1c2ggdGhlIGN1cnJlbnQgdXJsIG9udG8gaGlzdG9yeSBzbyBpdCBpc24ndCBsb3N0IGJlZm9yZSByZWRpcmVjdD9cbiAgICBjb25zdCB1cmwgPVxuICAgICAgcmVkaXJlY3RPcHRpb24gPT09IFJlZGlyZWN0RW51bS5VUkwgJiYgcmVkaXJlY3RMaW5rXG4gICAgICAgID8gXCJodHRwczovL1wiICsgcmVkaXJlY3RMaW5rXG4gICAgICAgIDogXCJub3RfYXZhaWxhYmxlL25vdF9hdmFpbGFibGUuaHRtbFwiO1xuICAgIGNocm9tZS50YWJzLnVwZGF0ZSh0YWJJZCwgeyB1cmwgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5zdXJlU2V0dGluZ3MoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gIGxldCBwcmV2U2V0dGluZ3MgPSBkYXRhLnNldHRpbmdzIHx8IHt9O1xuXG4gIGxldCB7IGlzQmxvY2tpbmcsIHNpdGVMaXN0LCBpc1doaXRlTGlzdGluZywgd2hpdGVMaXN0U2l0ZXMsIHJlZGlyZWN0TGluaywgcmVkaXJlY3RPcHRpb24gfSA9XG4gICAgcHJldlNldHRpbmdzO1xuXG4gIGlzQmxvY2tpbmcgPSBCb29sZWFuKGlzQmxvY2tpbmcpO1xuICBpc1doaXRlTGlzdGluZyA9IEJvb2xlYW4oaXNXaGl0ZUxpc3RpbmcpO1xuICBzaXRlTGlzdCA9IHNpdGVMaXN0ID09PSB1bmRlZmluZWQgPyBbXSA6IHNpdGVMaXN0O1xuICB3aGl0ZUxpc3RTaXRlcyA9IHdoaXRlTGlzdFNpdGVzID09PSB1bmRlZmluZWQgPyBbXSA6IHdoaXRlTGlzdFNpdGVzO1xuICByZWRpcmVjdExpbmsgPSByZWRpcmVjdExpbmsgfHwgXCJcIjtcbiAgcmVkaXJlY3RPcHRpb24gPSByZWRpcmVjdE9wdGlvbiB8fCBSZWRpcmVjdEVudW0uREVGQVVMVDtcbiAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgaXNCbG9ja2luZyxcbiAgICBzaXRlTGlzdCxcbiAgICBpc1doaXRlTGlzdGluZyxcbiAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICByZWRpcmVjdExpbmssXG4gICAgcmVkaXJlY3RPcHRpb24sXG4gIH07XG4gIC8vdXBkYXRlIHN0b3JhZ2UgdXNlIHRvIG5ldyBzZXQgZnVuY3Rpb25cbiAgbGV0IG5ld0RhdGEgPSB7fTtcbiAgc2V0U3RvcmFnZShcInNldHRpbmdzXCIsIHsgc2V0dGluZ3MgfSkudGhlbigoZGF0YSkgPT4ge1xuICAgIG5ld0RhdGEgPSBPYmplY3QuYXNzaWduKG5ld0RhdGEsIGRhdGEpO1xuICAgIGNhbGxiYWNrKG5ld0RhdGEpO1xuICB9KTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=