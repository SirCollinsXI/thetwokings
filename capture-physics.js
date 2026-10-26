(function(root){
 'use strict';
 // A catch is evaluated once, when the centre of the net crosses the torso.
 // Interpolating both positions at the crossing avoids frame-rate-dependent hits.
 function crossing(netBefore,netAfter,dinoBefore,dinoAfter,targetY,netWidth,bodyRadius){
  if(netAfter.y<=netBefore.y||netBefore.y>targetY||netAfter.y<targetY)return null;
  const t=(targetY-netBefore.y)/(netAfter.y-netBefore.y);
  const x=netBefore.x+(netAfter.x-netBefore.x)*t;
  const bodyX=dinoBefore+(dinoAfter-dinoBefore)*t;
  const overlap=Math.max(0,Math.min(x+netWidth/2,bodyX+bodyRadius)-Math.max(x-netWidth/2,bodyX-bodyRadius));
  const coverage=overlap/(bodyRadius*2);
  return {coverage,kind:coverage>=.65?'catch':coverage>0?'graze':'miss',bodyX,netX:x};
 }
 const api={crossing};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CapturePhysics=api;
})(typeof globalThis!=='undefined'?globalThis:this);
