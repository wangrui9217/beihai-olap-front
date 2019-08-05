import Quill from 'quill'
let Parchment = Quill.import('parchment')

let spacingClass = new Parchment.Attributor.Class('spacing', 'ql-spacing', {
  scope: Parchment.Scope.INLINE,
  whitelist: ['sp0','sp1', 'sp2', 'sp-1', 'sp-2','sp-3','sp-4']
});
export default spacingClass;
