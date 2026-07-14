// managed.js
// mount() が主権を持つDOMルートを記録し、$$ がその内側を「書き換えよう」と
// したときに警告するための小さなレジストリ。
//
// 【なぜ要るか】
//   Svelte/Vue は mount したサブツリーのDOMを自分で差分更新する。
//   そこへ $$ で textContent 等を当てると、フレームワークが握っている
//   テキストノードが差し替わり、以後の更新が「見えないノード」に流れて
//   画面が凍結する ─ しかもエラーは出ない(サイレント断線)。
//   jQuery脳の反射である $$("#id").text(...) が、まさにこの地雷を踏む。
//   → 踏んだ瞬間に気づけるよう、開発時に警告を出す。

const roots = new Set();

/** mount() の対象ルートを登録(このサブツリーはエンジンの主権下)。 */
export function registerManagedRoot(el) {
  if (el && el.nodeType === 1) roots.add(el);
}

/** destroy() 時に解除。 */
export function unregisterManagedRoot(el) {
  roots.delete(el);
}

/** node が管理下ルート自身か、その内側なら、そのルートを返す。無ければ null。 */
export function findManagingRoot(node) {
  if (!node || node.nodeType !== 1) return null;
  for (const root of roots) {
    if (root === node || root.contains(node)) return root;
  }
  return null;
}
