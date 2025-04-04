/************************************************************
 * govmapService.js
 *
 * קובץ שירות המדמה ממשק API לכל הפונקציות של govmap,
 * כפי שמופיעות בתיעוד שהצגת.
 *
 * שימוש:
 * 1. טען jQuery ו-govmap.api.js ב-html הראשי:
 *    <script src="https://code.jquery.com/jquery-1.12.1.min.js"></script>
 *    <script src="https://www.govmap.gov.il/govmap/api/govmap.api.js"></script>
 * 2. לאחר מכן, טען קובץ זה (או ייבא אותו ל-React).
 * 3. קרא לפונקציות לפי הצורך, למשל: govmapService.createMap(...).
 ************************************************************/

const govmapService = {
    /*************************************************
     * 1) יצירת מפה והגדרותיה
     *************************************************/
    createMap(divId, mapSettings) {
      if (!window.govmap?.createMap) return;
      return window.govmap.createMap(divId, mapSettings);
    },
  
    /*************************************************
     * 2) אירועי מפה
     *************************************************/
    // רישום לאירוע
    // שימוש: govmapService.onEvent(govmap.events.CLICK).then(...)
    onEvent(eventName) {
      if (!window.govmap?.onEvent) return;
      return window.govmap.onEvent(eventName);
    },
  
    // הסרת רישום לאירוע
    // שימוש: govmapService.unbindEvent(govmap.events.CLICK)
    unbindEvent(eventName) {
      if (!window.govmap?.unbindEvent) return;
      return window.govmap.unbindEvent(eventName);
    },
  
    /*************************************************
     * 3) ריענון / השפעה על תצוגת המפה
     *************************************************/
    refreshResource(params) {
      if (!window.govmap?.refreshResource) return;
      return window.govmap.refreshResource(params);
    },
  
    // שינוי רקע המפה
    // ערכי רקע לדוגמה: 0=מפה,1=תצ"א,2=משולב,3=רחובות/2.5D
    setBackground(bgId) {
      if (!window.govmap?.setBackground) return;
      return window.govmap.setBackground(bgId);
    },
  
    // שינוי סמן העכבר
    // שימוש: govmapService.setMapCursor(govmap.cursorType.TARGET)
    setMapCursor(cursorType) {
      if (!window.govmap?.setMapCursor) return;
      return window.govmap.setMapCursor(cursorType);
    },
  
    // חזרה לכלי ברירת מחדל (מצב Pan)
    setDefaultTool() {
      if (!window.govmap?.setDefaultTool) return;
      return window.govmap.setDefaultTool();
    },
  
    /*************************************************
     * 4) מדידות
     *************************************************/
    // פותח חלון כלי מדידה (מרחק)
    showMeasure() {
      if (!window.govmap?.showMeasure) return;
      return window.govmap.showMeasure();
    },
  
    // (לא תמיד מתועד רשמית) מדידת שטח
    showAreaMeasure() {
      if (!window.govmap?.showAreaMeasure) return;
      return window.govmap.showAreaMeasure();
    },
  
    // (לא תמיד מתועד רשמית) מדידת זווית
    showAngleMeasure() {
      if (!window.govmap?.showAngleMeasure) return;
      return window.govmap.showAngleMeasure();
    },
  
    /*************************************************
     * 5) ציור גאומטריות
     *************************************************/
    // הפעלת מצב ציור לפי drawType:
    // govmap.drawType.Point / Polyline / Polygon / Circle / Rectangle / FreehandPolygon
    // הפונקציה מחזירה Promise שניתן לחבר אליה then(...) או progress(...).
    draw(drawTypeOrGeometry) {
      if (!window.govmap?.draw) return;
      return window.govmap.draw(drawTypeOrGeometry);
    },
  
    // לאחר ציור, מאפשר לבצע התמקדות לגאומטריה
    zoomToDrawing() {
      if (!window.govmap?.zoomToDrawing) return;
      return window.govmap.zoomToDrawing();
    },
  
    // ניקוי כל הציורים שהמשתמש עשה ע"י govmap.draw
    clearDrawings() {
      if (!window.govmap?.clearDrawings) return;
      return window.govmap.clearDrawings();
    },
  
    /*************************************************
     * 6) ניהול שכבות
     *************************************************/
    // הצגת/הסתרת שכבות (הדלקה/כיבוי)
    setVisibleLayers(layersOn, layersOff) {
      if (!window.govmap?.setVisibleLayers) return;
      return window.govmap.setVisibleLayers(layersOn, layersOff);
    },
  
    // סינון שכבה (Definition Query)
    filterLayers(params) {
      if (!window.govmap?.filterLayers) return;
      return window.govmap.filterLayers(params);
    },
  
    /*************************************************
     * 7) הוספה/הסרה של שכבות מידע בצד הלקוח
     *************************************************/
    // הצגת אוסף גאומטריות (נקודות/קווים/פוליגונים) מהמארח
    // החזרה היא Promise של מערך ID-ים
    displayGeometries(data) {
      if (!window.govmap?.displayGeometries) return;
      return window.govmap.displayGeometries(data);
    },
  
    // מחיקת גאומטריות לפי שם
    clearGeometriesByName(names) {
      if (!window.govmap?.clearGeometriesByName) return;
      return window.govmap.clearGeometriesByName(names);
    },
  
    // מחיקת גאומטריות לפי מזהה (ID)
    clearGeometriesById(ids) {
      if (!window.govmap?.clearGeometriesById) return;
      return window.govmap.clearGeometriesById(ids);
    },
  
    // הוספת שכבת רקע חיצונית (Custom)
    addCustomBackground(params) {
      if (!window.govmap?.addCustomBackground) return;
      return window.govmap.addCustomBackground(params);
    },
  
    // הוספת מפת רקע מורשית שלא קיימת בברירת מחדל
    addAuthorizedBackground(bgId) {
      if (!window.govmap?.addAuthorizedBackground) return;
      return window.govmap.addAuthorizedBackground(bgId);
    },
  
    /*************************************************
     * 8) מפת חום (Heatmap)
     *************************************************/
    setHeatLayer(params) {
      if (!window.govmap?.setHeatLayer) return;
      return window.govmap.setHeatLayer(params);
    },
  
    removeHeatLayer() {
      if (!window.govmap?.removeHeatLayer) return;
      return window.govmap.removeHeatLayer();
    },
  
    changeHeatLayerValueField(fieldName) {
      if (!window.govmap?.changeHeatLayerValueField) return;
      return window.govmap.changeHeatLayerValueField(fieldName);
    },
  
    /*************************************************
     * 9) zoom / התמקדות / ניווט / מיקום
     *************************************************/
    // התמקדות לנקודה
    zoomToPoint(x, y, level = 10) {
      if (!window.govmap?.zoomToPoint) return;
      return window.govmap.zoomToPoint(x, y, level);
    },
  
    // התמקדות לתיחום (extent)
    zoomToExtent(extent) {
      if (!window.govmap?.zoomToExtent) return;
      return window.govmap.zoomToExtent(extent);
    },
  
    // התמקדות לפי xy ורמת זום, marker: האם לשים סמן
    zoomToXY(params) {
      if (!window.govmap?.zoomToXY) return;
      return window.govmap.zoomToXY(params);
    },
  
    // הסרת סמן שהוצב ע"י zoomToXY עם marker:true
    clearMapMarker() {
      if (!window.govmap?.clearMapMarker) return;
      return window.govmap.clearMapMarker();
    },
  
    // מקבל את מרכז המפה
    getCenter() {
      if (!window.govmap?.getCenter) return null;
      return window.govmap.getCenter();
    },
  
    // מקבל Extent נוכחי
    getExtent() {
      if (!window.govmap?.getExtent) return null;
      return window.govmap.getExtent();
    },
  
    // בקשה לקבלת נקודה בלחיצה על המפה
    // מחזיר Promise. שימוש: govmapService.getXY().progress(...)
    getXY() {
      if (!window.govmap?.getXY) return;
      return window.govmap.getXY();
    },
  
    /*************************************************
     * 10) חיפוש / שאילתות / אינטרסקציות
     *************************************************/
    // תשאול נקודתי על המפה
    identify(params) {
      if (!window.govmap?.identify) return;
      return window.govmap.identify(params);
    },
  
    // חיפוש ישויות לפי כתובת/פוליגון/קואורדינטות
    intersectFeatures(params) {
      if (!window.govmap?.intersectFeatures) return;
      return window.govmap.intersectFeatures(params);
    },
  
    // חיפוש לפי כתובת -> קואורדינטות
    geocode(params) {
      if (!window.govmap?.geocode) return;
      return window.govmap.geocode(params);
    },
  
    // הפוך: קואורדינטות -> כתובת
    reverseGeocode(x, y) {
      if (!window.govmap?.reverseGeocode) return;
      return window.govmap.reverseGeocode(x, y);
    },
  
    // חיפוש גוש חלקה לכתובת או הפוך
    // סוג: govmap.locateType.addressToLotParcel | lotParcelToAddress
    searchAndLocate(params) {
      if (!window.govmap?.searchAndLocate) return;
      return window.govmap.searchAndLocate(params);
    },
  
    // קבלת שכבה המוגדרת כפתוחה (open source)
    addOpenSourceLayer(params) {
      if (!window.govmap?.addOpenSourceLayer) return;
      return window.govmap.addOpenSourceLayer(params);
    },
  
    // קבלת מקרא (legend) של שכבה (מבוסס גנרציה)
    getLegend(params) {
      if (!window.govmap?.getLegend) return;
      return window.govmap.getLegend(params);
    },
  
    // קבלת מידע משכבה לפי קואורדינטות ורדיוס
    getLayerData(params) {
      if (!window.govmap?.getLayerData) return;
      return window.govmap.getLayerData(params);
    },
  
    // selectFeaturesOnMap - כלי פנימי לסימון ישויות במפה
    selectFeaturesOnMap(interfaceName, drawType, continuous) {
      if (!window.govmap?.selectFeaturesOnMap) return;
      return window.govmap.selectFeaturesOnMap(interfaceName, drawType, continuous);
    },
  
    // סגירת בועית פתוחה
    closeBubble() {
      if (!window.govmap?.closeBubble) return;
      return window.govmap.closeBubble();
    },
  
    // חיפוש ישויות בשכבה לפי ערכי שדה
    searchInLayer(params) {
      if (!window.govmap?.searchInLayer) return;
      return window.govmap.searchInLayer(params);
    },
  
    /*************************************************
     * 11) פעולות על שכבת משתמש
     *************************************************/
    // קבלת ישויות של שכבת משתמש
    // דורש הרשאות token מתאימות
    getLayerEntities(params) {
      if (!window.govmap?.getLayerEntities) return;
      return window.govmap.getLayerEntities(params);
    },
  
    // הוספה/עדכון/מחיקה של ישויות בשכבת משתמש (saveAction)
    saveLayerEntities(params) {
      if (!window.govmap?.saveLayerEntities) return;
      return window.govmap.saveLayerEntities(params);
    },
  
    // קבלת מבנה דוגמה (sample) להוספת ישויות
    getAddEntitiesSample(params) {
      if (!window.govmap?.getAddEntitiesSample) return;
      return window.govmap.getAddEntitiesSample(params);
    },

    intersectFeatures(params) {
        if (!window.govmap?.intersectFeatures) return;
        return window.govmap.intersectFeatures(params);
      },
  
    /*************************************************
     * 12) פונקציה המוסיפה שורת חיפוש מובנית במפה
     *************************************************/
    addSearchBar(options = {}) {
      if (!window.govmap) {
        console.error("govmap לא נטען עדיין!");
        return;
      }
  
      // הגדרות ברירת מחדל
      const defaults = {
        placeholder: "הכנס כתובת",
        buttonText: "חפש",
        xLevel: 10, // רמת זום שאליה נתמקד בחיפוש מוצלח
      };
      const config = { ...defaults, ...options };
  
      // מחפשים את הקונטיינר שאליו נזריק את החיפוש (רצוי .gmToolsContainer)
      const $toolsContainer = window.jQuery("#map .gmToolsContainer");
      if ($toolsContainer.length === 0) {
        console.warn("לא נמצא gmToolsContainer - נזריק בכל זאת לתוך #map");
      }
  
      // בדיקה אם כבר הוספנו
      if (window.jQuery("#custom-search-bar").length > 0) {
        return; // כבר קיים
      }
  
      // בונים HTML של שורת חיפוש
      const $searchBar = window.jQuery(`
        <div id="custom-search-bar" style="display:flex; gap:4px; margin-top:5px;">
          <input type="text" id="custom-search-input" style="width:120px;padding:3px;" placeholder="${config.placeholder}" />
          <button id="custom-search-button">${config.buttonText}</button>
        </div>
      `);
  
      // הקלקה על כפתור החיפוש => geocode + zoom
      $searchBar.find("#custom-search-button").on("click", async () => {
        const address = $searchBar.find("#custom-search-input").val().trim();
        if (!address) return;
  
        try {
          const response = await this.geocode({
            keyword: address,
            type: window.govmap.geocodeType.FullResult,
          });
          if (response?.data?.length > 0) {
            const first = response.data[0];
            // נתמקד לכתובת הראשונה שנמצאה
            if (first.X && first.Y) {
              this.zoomToXY({
                x: first.X,
                y: first.Y,
                level: config.xLevel,
                marker: true,
              });
            }
          } else {
            console.log("לא נמצאו תוצאות עבור:", address);
          }
        } catch (err) {
          console.error("שגיאה בעת החיפוש:", err);
        }
      });
  
      // מזריקים לתוך הכלי אם קיים, אחרת ישירות ל-#map
      if ($toolsContainer.length > 0) {
        $toolsContainer.append($searchBar);
      } else {
        window.jQuery("#map").append($searchBar);
      }
    },
  };
  
  /************************************************************
   * ייצוא ברירת מחדל
   ************************************************************/
  export default govmapService;
  