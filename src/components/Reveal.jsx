import { useReveal } from '../hooks/useReveal';

export default function Reveal({ as: Tag = 'div', className = '', stagger = false, children, ...rest }) {
  const [ref, visible] = useReveal();
  const cls = `${stagger ? 'stagger' : 'reveal'}${visible ? ' is-visible' : ''} ${className}`.trim();

  return (
    <Tag ref={ref} className={cls} {...rest}>
      {children}
    </Tag>
  );
}
