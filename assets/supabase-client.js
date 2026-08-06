/* The Two Kings minimal Supabase HTTP client. No tracking, no external CDN. */
(function(){
  'use strict';
  class Query {
    constructor(url,key,table){this.url=url;this.key=key;this.table=table;this.params=new URLSearchParams();}
    select(columns='*'){this.params.set('select',columns);return this;}
    eq(column,value){this.params.set(column,'eq.'+String(value));return this;}
    order(column,options={}){const item=column+'.'+(options.ascending===false?'desc':'asc');const old=this.params.get('order');this.params.set('order',old?old+','+item:item);return this;}
    limit(value){this.params.set('limit',String(value));return this;}
    async execute(){
      try{
        const response=await fetch(this.url+'/rest/v1/'+encodeURIComponent(this.table)+'?'+this.params.toString(),{
          headers:{apikey:this.key,Authorization:'Bearer '+this.key,Accept:'application/json'}
        });
        const body=await response.json().catch(()=>null);
        if(!response.ok)return{data:null,error:{message:body?.message||'Leaderboard-Anfrage fehlgeschlagen.',status:response.status}};
        return{data:body,error:null};
      }catch(error){return{data:null,error};}
    }
    then(resolve,reject){return this.execute().then(resolve,reject);}
  }
  window.createTtkSupabaseClient=function(url,key){
    const base=String(url).replace(/\/$/,'');
    return{
      from(table){return new Query(base,key,table);},
      functions:{
        async invoke(name,{body}={}){
          try{
            const response=await fetch(base+'/functions/v1/'+encodeURIComponent(name),{
              method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body??{})
            });
            const data=await response.json().catch(()=>null);
            if(!response.ok)return{data,error:{message:data?.message||'Score-Anfrage fehlgeschlagen.',status:response.status}};
            return{data,error:null};
          }catch(error){return{data:null,error};}
        }
      }
    };
  };
})();
