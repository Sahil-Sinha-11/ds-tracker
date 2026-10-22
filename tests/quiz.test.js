// node --test tests/quiz.test.js
const test=require("node:test"),assert=require("node:assert");
const Q=require("../quiz.js");

test("every question is well formed",()=>{
  const ids=new Set();
  for(const l of Q.LECS)for(const x of l.qs){
    assert.ok(!ids.has(x.id),"duplicate id "+x.id);ids.add(x.id);
    assert.ok(x.q&&x.h&&x.e,x.id+" needs q, h and e");
    assert.ok(x.o.length>=2&&x.o.every(o=>typeof o==="string"&&o),x.id+" options");
    assert.ok(x.a.length>=1&&x.a.every(i=>Number.isInteger(i)&&i>=0&&i<x.o.length),x.id+" answers");
    assert.equal(new Set(x.a).size,x.a.length,x.id+" repeated answer");
    assert.equal(new Set(x.o).size,x.o.length,x.id+" repeated option");
    assert.ok(x.a.length<x.o.length,x.id+" can't have every option right");
  }
});

test("option order is a stable permutation that changes with the seed",()=>{
  let moved=0;
  for(const x of Q.byId.values()){
    for(const seed of [1,42,999999,123456]){
      const o=Q.order(x,seed);
      assert.deepEqual([...o].sort((a,b)=>a-b),x.o.map((_,i)=>i),x.id);
      assert.deepEqual(Q.order(x,seed),o);
    }
    if(Q.order(x,1).join()!==Q.order(x,2).join())moved++;
  }
  assert.ok(moved>Q.byId.size/2);
});

test("grading needs exactly the right options",()=>{
  const x={a:[0,2]};
  assert.ok(Q.grade(x,[2,0]));
  assert.ok(!Q.grade(x,[0]));
  assert.ok(!Q.grade(x,[0,1,2]));
  assert.ok(Q.grade({a:[1]},[1]));
});

test("records keep the first attempt and the latest result",()=>{
  const st={},R=Q.ensure(st),x=Q.byId.get("dbms-11-1");
  assert.equal(Q.record(R,x,[1],false,"2026-10-22"),false);
  assert.equal(Q.record(R,x,x.a,false,"2026-10-23"),true);
  assert.deepEqual(R.r[x.id],{n:2,f:false,ok:true,h:false,d:"2026-10-23"});
  const y=Q.byId.get("dbms-11-2");Q.record(R,y,y.a,true,"2026-10-22");
  assert.equal(R.r[y.id].f,false,"a hint means not right on the first try");
  assert.deepEqual(Q.stats(R,[x,y]),{n:2,seen:2,ok:2,wrong:0,first:0});
});
