import type { FormDefinition, FormField } from '../../types/forms';
import { getFormsLibraryForBuild } from '../forms';

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderField(field: FormField): string {
	const id = `field-${field.id}`;
	const required = field.required ? ' required' : '';
	const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : '';
	const help = field.helpText ? `<span class="cms-form-help">${escapeHtml(field.helpText)}</span>` : '';
	const defaultVal = field.defaultValue ? ` value="${escapeHtml(field.defaultValue)}"` : '';

	if (field.type === 'textarea') {
		return `<label class="cms-form-field" for="${id}"><span class="cms-form-label">${escapeHtml(field.label)}${field.required ? ' *' : ''}</span><textarea id="${id}" name="${field.id}" rows="4"${placeholder}${required}>${escapeHtml(field.defaultValue ?? '')}</textarea>${help}</label>`;
	}

	if (field.type === 'dropdown') {
		const options = (field.options ?? [])
			.map((o) => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`)
			.join('');
		return `<label class="cms-form-field" for="${id}"><span class="cms-form-label">${escapeHtml(field.label)}${field.required ? ' *' : ''}</span><select id="${id}" name="${field.id}"${required}>${options}</select>${help}</label>`;
	}

	if (field.type === 'radio') {
		const items = (field.options ?? [])
			.map(
				(o, i) =>
					`<label class="cms-form-choice"><input type="radio" name="${field.id}" value="${escapeHtml(o.value)}"${required && i === 0 ? ' required' : ''}${field.defaultValue === o.value ? ' checked' : ''} /> ${escapeHtml(o.label)}</label>`,
			)
			.join('');
		return `<fieldset class="cms-form-field"><legend class="cms-form-label">${escapeHtml(field.label)}${field.required ? ' *' : ''}</legend>${items}${help}</fieldset>`;
	}

	if (field.type === 'checkbox') {
		const items = (field.options ?? []).length
			? (field.options ?? [])
				.map(
					(o) =>
						`<label class="cms-form-choice"><input type="checkbox" name="${field.id}" value="${escapeHtml(o.value)}" /> ${escapeHtml(o.label)}</label>`,
				)
				.join('')
			: `<label class="cms-form-choice"><input type="checkbox" name="${field.id}" value="yes"${field.defaultValue ? ' checked' : ''}${required} /> ${escapeHtml(field.label)}</label>`;
		return `<fieldset class="cms-form-field"><legend class="cms-form-label">${escapeHtml(field.label)}${field.required ? ' *' : ''}</legend>${items}${help}</fieldset>`;
	}

	if (field.type === 'hidden') {
		return `<input type="hidden" name="${field.id}" value="${escapeHtml(field.defaultValue ?? '')}" />`;
	}

	const inputType =
		field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';

	return `<label class="cms-form-field" for="${id}"><span class="cms-form-label">${escapeHtml(field.label)}${field.required ? ' *' : ''}</span><input type="${inputType}" id="${id}" name="${field.id}"${placeholder}${defaultVal}${required} />${help}</label>`;
}

export function getFormDefinition(formId: string): FormDefinition | undefined {
	const library = getFormsLibraryForBuild();
	return library.forms.find((f) => f.id === formId);
}

export function renderFormHtml(formId: string, pageSlug?: string): string {
	const form = getFormDefinition(formId);
	if (!form) {
		return `<div class="cms-form-missing">Form not found. Select a form in the editor.</div>`;
	}

	const fields = form.fields.map(renderField).join('');
	const pageAttr = pageSlug ? ` data-page-slug="${escapeHtml(pageSlug)}"` : '';

	return `<div class="cms-form-wrap" data-form-id="${escapeHtml(form.id)}" data-form-name="${escapeHtml(form.name)}" data-success="${escapeHtml(form.successMessage)}"${pageAttr}>
<form class="cms-form" novalidate>
${fields}
<button type="submit" class="btn btn-primary cms-form-submit">${escapeHtml(form.submitLabel)}</button>
</form>
<div class="cms-form-feedback" hidden></div>
</div>
<script>
(function(){
document.querySelectorAll('.cms-form-wrap').forEach(function(wrap){
if(wrap.dataset.bound)return;
wrap.dataset.bound='1';
var form=wrap.querySelector('.cms-form');
var feedback=wrap.querySelector('.cms-form-feedback');
if(!form)return;
form.addEventListener('submit',async function(e){
e.preventDefault();
feedback.hidden=true;
feedback.className='cms-form-feedback';
var fd=new FormData(form);
var values={};
fd.forEach(function(v,k){
if(values[k]){values[k]=Array.isArray(values[k])?values[k].concat([v]):[values[k],v];}
else{values[k]=v;}
});
try{
var res=await fetch('/api/form-submissions',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
formId:wrap.dataset.formId,
formName:wrap.dataset.formName,
pageSlug:wrap.dataset.pageSlug||undefined,
values:values
})
});
var data=await res.json();
if(!res.ok)throw new Error(data.error||'Submit failed');
feedback.textContent=wrap.dataset.success||'Thank you!';
feedback.className='cms-form-feedback is-success';
feedback.hidden=false;
form.reset();
}catch(err){
feedback.textContent=err.message||'Something went wrong.';
feedback.className='cms-form-feedback is-error';
feedback.hidden=false;
}
});
});
})();
</script>`;
}
