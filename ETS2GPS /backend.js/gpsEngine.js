class GPSEngine
{
  constructor(mapContainerId)
  {
    //initialize lealfelt map with simple CRS for game flat grid
  this.map = L.map(mapContainerId,
                   {
                     crs: L.CRS.Simple,
                     minZoom: -5,
                     maxZoom: 3,
                    zoomControl: true
  });
  //custom truck icon marker
const truckIcon =L.divIcon({
  className: 'truck-maker',
  html: '<div style="font-size: 24px; text-shadow: 0 0 5px #000;">🚛</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});
this.marker = L.marker([0, 0],{ icon: truckIcon }).addTo(this.map);
this.map.setView([0, 0], 0);
}
/**
* Updates truck position on the leaflet map
* @param {number} x - ETS2 Placement X coordinate
* @param {number} z - ETS2 Placement Z coordinate
*/
updatePosition(x, z)
{
  if (typeof x !=='number' || typeof z !== 'number') return;
      //ETS2 X = East/west (lng), ETS2 -Z = North/South (Lat)
    const lat = -z;
  const lng = x;

const newPos = [lat, lng];
  this.marker.setLatLng(newPos);
  this.map.panTo(newPos, { animate: true, duration: 0.5});
}
/**
* Calculates Real-Life ETA from in-game remaining minutes
* @param {number} remainderGameMinutes -Minutes left in game
* @param {boolean} inCity - true if scale is 1:3, false for 1:19
*/
calculateETA(remainingGameMinutes, inCity = false) {
if (!remainingGameMinutes || remainingGameMinutes <= 0)
{
  return { gameETA: '0h 0m', realETA: '0 min'};
}
  const scaleFactor = inCity ? 3 : 19;
  const realLifeMinutes = Math.round(remainingGameMinutes / scaleFactor);

const gameHour = Math.floor(remainingGameMinutes/60);
  const gameMinutes = Math.round(remainingGameMinutes % 60);

return{
  gameETA: `${gameHour}h ${gameMins}m`,
  realETA: realLifeMinutes < 60
  ? `${realLifeMinutes} mins`
    : `${Math.floor(realLifeMinutes / 60)}h ${realLifeMinutes % 60} mins`
};
}
}
