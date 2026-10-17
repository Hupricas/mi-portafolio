(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const get=(form,name)=>form.elements.namedItem(name);
 const put=(form,name,value)=>{const field=get(form,name);if(field)field.value=value??''};
 const read=(form,name)=>(get(form,name)?.value||'').trim();
 const csv=s=>s.split(',').map(v=>v.trim()).filter(Boolean);
 const lines=s=>s.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
 const make=(tag,cls,txt)=>{const a=document.createElement(tag);if(cls)a.className=cls;if(txt!==undefined)a.textContent=txt;return a};
 let state={perfil:{},habilidades:[],proyectos:[],certificados:[]};
 let projectIndex=-1,certIndex=-1,dirty=false;
 const project=$('project-form'),cert=$('certificate-form'),profile=$('profile-form');
 const profileFields=['nombre','cargo','titular','presentacion','sobreMi','ubicacion','email','github','linkedin','cv'];
 function toast(message){const e=$('message');e.textContent=message;e.classList.add('visible');setTimeout(()=>e.classList.remove('visible'),3500)}
 function changed(){dirty=true;$('save-state').textContent='Cambios pendientes de guardar';}
 function formSync(){profileFields.forEach(k=>state.perfil[k]=read(profile,k));state.habilidades=csv(read(profile,'habilidades'));}
 function fillProfile(){profileFields.forEach(k=>put(profile,k,state.perfil[k]));put(profile,'habilidades',state.habilidades.join(', '));}
 function renderList(items,id,type){
  const area=$(id);area.replaceChildren();
  if(!items.length){area.append(make('p','nothing','Todavía no hay elementos.'));return;}
  items.forEach((item,index)=>{
    const row=make('div','item');const info=make('div');
    info.append(make('strong','',item.titulo||'Sin título'),make('span','',type==='project'?item.categoria:item.entidad));
    const buttons=make('div','item-actions');
    const edit=make('button','','Editar');edit.type='button';edit.onclick=()=>editItem(type,index);
    const up=make('button','','↑');up.type='button';up.title='Subir';up.disabled=index===0;up.onclick=()=>move(type,index,-1);
    const down=make('button','','↓');down.type='button';down.title='Bajar';down.disabled=index===items.length-1;down.onclick=()=>move(type,index,1);
    const del=make('button','danger','Eliminar');del.type='button';del.onclick=()=>{
      if(!confirm('¿Eliminar '+(item.titulo||'este elemento')+'?'))return;
      items.splice(index,1);resetForms();render();changed();
    };
    buttons.append(edit,up,down,del);row.append(info,buttons);area.append(row);
  });
 }
 function move(type,index,offset){const arr=type==='project'?state.proyectos:state.certificados;const next=index+offset;[arr[index],arr[next]]=[arr[next],arr[index]];resetForms();render();changed()}
 function render(){renderList(state.proyectos,'project-items','project');renderList(state.certificados,'certificate-items','certificate')}
 function resetForms(){project.reset();cert.reset();projectIndex=certIndex=-1;$('project-form-title').textContent='Añadir proyecto';$('certificate-form-title').textContent='Añadir certificado';$('project-submit').textContent='Añadir proyecto';$('certificate-submit').textContent='Añadir certificado';document.querySelectorAll('.cancel').forEach(b=>b.hidden=true)}
 function encodeLinks(links){return (links||[]).map(l=>[l.texto||'',l.url||'',l.clase||''].join(' | ')).join('\n')}
 function parseLinks(value){return lines(value).map(line=>{const parts=line.split('|').map(p=>p.trim());return {texto:parts[0]||'Abrir',url:parts[1]||'',clase:parts[2]||''}}).filter(link=>link.url)}
 function editItem(type,index){
  const isProject=type==='project',form=isProject?project:cert,item=(isProject?state.proyectos:state.certificados)[index];
  if(isProject){
   projectIndex=index;
   ['titulo','categoria','descripcion','imagen','github','demo'].forEach(n=>put(form,n,item[n]));
   put(form,'tecnologias',(item.tecnologias||[]).join(', '));put(form,'galeria',(item.galeria||[]).join('\n'));
   put(form,'enlaces',encodeLinks(item.enlaces));put(form,'destacado',String(!!item.destacado));put(form,'modoImagen',item.modoImagen||'normal');
  }else{certIndex=index;['titulo','entidad','fecha','tipo','descripcion','archivo','imagen'].forEach(n=>put(form,n,item[n]))}
  $(isProject?'project-form-title':'certificate-form-title').textContent='Editar '+(isProject?'proyecto':'certificado');
  $(isProject?'project-submit':'certificate-submit').textContent='Aplicar edición';form.querySelector('.cancel').hidden=false;
  form.scrollIntoView({behavior:'smooth',block:'start'});
 }
 project.addEventListener('submit',e=>{
  e.preventDefault();
  const old=projectIndex>=0?state.proyectos[projectIndex]:{};
  const item={...old};
  ['titulo','categoria','descripcion','imagen','github','demo'].forEach(k=>item[k]=read(project,k));
  item.tecnologias=csv(read(project,'tecnologias'));item.galeria=lines(read(project,'galeria'));
  item.enlaces=parseLinks(read(project,'enlaces'));
  item.destacado=read(project,'destacado')==='true';
  item.modoImagen=read(project,'modoImagen')==='icono'?'icono':'normal';
  if(projectIndex>=0)state.proyectos[projectIndex]=item;else state.proyectos.push(item);
  resetForms();render();changed();toast('Proyecto actualizado. Pulsa Guardar todos los cambios.');
 });
 cert.addEventListener('submit',e=>{
  e.preventDefault();const old=certIndex>=0?state.certificados[certIndex]:{};const item={...old};
  ['titulo','entidad','fecha','tipo','descripcion','archivo','imagen'].forEach(k=>item[k]=read(cert,k));
  if(certIndex>=0)state.certificados[certIndex]=item;else state.certificados.push(item);
  resetForms();render();changed();toast('Certificado actualizado. Pulsa Guardar todos los cambios.');
 });
 profile.addEventListener('input',()=>{formSync();changed()});
 document.querySelectorAll('.cancel').forEach(b=>b.addEventListener('click',resetForms));
 async function upload(button){
  const target=button.dataset.target;const [formId,fieldName]=target.split(':');const form=$(formId);
  const input=button.parentElement.querySelector('input[type=file]');const file=input.files[0];
  if(!file){toast('Primero selecciona un archivo.');return}
  button.disabled=true;button.textContent='Subiendo…';
  try{
   const response=await fetch('/api/upload',{method:'POST',headers:{'X-Upload-Type':button.dataset.type,'X-Upload-Name':file.name},body:file});
   const result=await response.json();if(!response.ok)throw Error(result.error||'No se pudo subir');
   const field=get(form,fieldName);
   if(button.dataset.apk==='true')field.value+=(field.value.trim()?'\n':'')+'Descargar APK ↘ | '+result.path+' | apk-download';
   else if(button.dataset.append==='true')field.value+=(field.value.trim()?'\n':'')+result.path;
   else field.value=result.path;
   input.value='';toast('Archivo copiado a '+result.path+'. Aplica la edición del formulario.');
  }catch(ex){toast('Error: '+ex.message)}finally{button.disabled=false;button.textContent=button.dataset.apk==='true'?'Subir APK y añadir botón':button.dataset.append==='true'?'Subir captura':button.dataset.type==='certificados'?'Subir PDF':'Subir imagen'}
 }
 document.querySelectorAll('.upload').forEach(b=>b.addEventListener('click',()=>upload(b)));
 $('save').addEventListener('click',async()=>{
   formSync();const b=$('save');b.disabled=true;b.textContent='Guardando…';
   try{
    const response=await fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(state)});
    const data=await response.json();if(!response.ok)throw Error(data.error||'Error al guardar');
    dirty=false;$('save-state').textContent='Guardado correctamente en contenido.js. Ya puedes publicar con GitHub Desktop.';
    toast('Guardado correctamente.');
   }catch(ex){toast('Error: '+ex.message);$('save-state').textContent=ex.message}finally{b.disabled=false;b.textContent='Guardar todos los cambios'}
 });
 window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue=''}});
 async function start(){
  try{
   const response=await fetch('/api/data',{cache:'no-store'});if(!response.ok)throw Error('Servidor local no disponible');
   state=await response.json();fillProfile();render();const conn=$('connection-status');conn.textContent='● Editor conectado. Los cambios se guardarán en tu carpeta local.';conn.className='connection online';
  }catch(ex){const conn=$('connection-status');conn.textContent='Editor sin conexión. Abre ABRIR-EDITOR.bat en lugar de abrir editor.html directamente.';conn.className='connection offline';document.querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=true)}
 }
 start();
})();
