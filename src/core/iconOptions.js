export const ICON_BORDER_OPTIONS = ['ring-slate', 'ring-emerald', 'ring-amber', 'ring-rose'];
export const ICON_BACKGROUND_OPTIONS = ['bg-night', 'bg-ocean', 'bg-sunset', 'bg-forest'];
export const ICON_CENTER_OBJECT_OPTIONS = ['dot', 'diamond', 'barbell', 'bolt'];

export const normalizeIconOption = (value, options, fallback) => {
  if (options.includes(value)) return value;
  return fallback;
};

export const normalizeIconConfig = (icon = {}) => ({
  icon_border: normalizeIconOption(icon.icon_border, ICON_BORDER_OPTIONS, ICON_BORDER_OPTIONS[0]),
  icon_background: normalizeIconOption(icon.icon_background, ICON_BACKGROUND_OPTIONS, ICON_BACKGROUND_OPTIONS[0]),
  icon_center_object: normalizeIconOption(icon.icon_center_object, ICON_CENTER_OBJECT_OPTIONS, ICON_CENTER_OBJECT_OPTIONS[0]),
});
