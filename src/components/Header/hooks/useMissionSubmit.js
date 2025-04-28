import { useCallback } from "react";

export function useMissionSubmit(navigate, setIsSubmitting, setIsLoadingRoute) {
  const sendMission = useCallback(async ({
    orthoImageUrl,
    drawPixelsOnStreetsImage,
    boundingBox,
    setIsSubmittingCallback = () => {},
    setIsLoadingRouteCallback = () => {},
  }) => {
    if (!orthoImageUrl || !drawPixelsOnStreetsImage || !boundingBox) return;

    setIsSubmitting(true);
    setIsLoadingRoute(true);

    try {
      const orthoBlob = await (await fetch(orthoImageUrl)).blob();
      const streetsBlob = await drawPixelsOnStreetsImage();

      const formData = new FormData();
      formData.append("satellite_image", orthoBlob, "ortho.png");
      formData.append("buildings_image", streetsBlob, "streets_with_markers.png");
      formData.append("top_left_coord", `(${boundingBox.x1}, ${boundingBox.y1})`);
      formData.append("bottom_right_coord", `(${boundingBox.x2}, ${boundingBox.y2})`);

      const response = await fetch("https://skyops-backend-production.up.railway.app/api/create-mission", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "שליחה נכשלה");
      }

      navigate("/mission-result", {
        state: {
          imageUrl: result.satelliteImageUrl,
          textFileUrl: result.coordinatesFileUrl,
        },
      });
    } catch (error) {
      console.error("❌ שגיאה בשליחה לשרת:", error);
      alert("אירעה שגיאה בשליחת המשימה.");
      setIsSubmittingCallback(false);
      setIsLoadingRouteCallback(false);
    }
  }, [navigate, setIsSubmitting, setIsLoadingRoute]);

  return { sendMission };
}
