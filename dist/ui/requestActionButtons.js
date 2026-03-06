const createBtn = (label, className = '') => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = className;
  btn.textContent = label;
  return btn;
};

export const createIncomingRequestActions = ({ onApprove, onReject }) => {
  const wrap = document.createElement('div');
  wrap.className = 'hero__actions';

  const approve = createBtn('承認');
  approve.addEventListener('click', () => onApprove?.());

  const reject = createBtn('拒否', 'ghost');
  reject.addEventListener('click', () => onReject?.());

  wrap.append(approve, reject);
  return wrap;
};

export const createOutgoingRequestActions = ({ onCancel }) => {
  const wrap = document.createElement('div');
  wrap.className = 'hero__actions';

  const cancel = createBtn('リクエスト取消', 'ghost');
  cancel.addEventListener('click', () => onCancel?.());
  wrap.append(cancel);

  return wrap;
};
