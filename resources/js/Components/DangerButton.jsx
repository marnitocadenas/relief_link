import { Button } from './UI';

export default function DangerButton({ children, className = '', ...props }) {
    return <Button variant="danger" className={className} {...props}>{children}</Button>;
}