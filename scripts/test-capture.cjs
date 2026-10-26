const assert=require('node:assert/strict');const {crossing}=require('../capture-physics.js');
const hit=(x,a=500,b=500)=>crossing({x,y:0},{x,y:1000},a,b,500,185,62);
assert.equal(hit(500).kind,'catch');assert.equal(hit(700).kind,'miss');assert.equal(hit(625).kind,'graze');
assert.equal(crossing({x:500,y:10},{x:500,y:10},500,500,500,185,62),null);
assert.equal(crossing({x:500,y:600},{x:500,y:700},500,500,500,185,62),null);
assert.equal(hit(500,0,1000).kind,'catch'); // fast horizontal motion must be sampled at actual crossing
for(const fps of [15,30,60,120]){let previousY=0,previousX=400,result=null;for(let i=1;i<=fps;i++){let y=1000*i/fps,x=400+200*i/fps;result=crossing({x:500,y:previousY},{x:500,y},previousX,x,505,185,62)||result;previousY=y;previousX=x}assert.equal(result.kind,'catch')}
console.log('Capture rules: centred catch, graze, miss, no duplicate/zero movement, fast motion and 15–120 FPS passed.');
