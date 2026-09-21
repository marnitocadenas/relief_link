import { Button } from './UI';

export default function PrimaryButton({ children, className = '', ...props }) {
    return <Button variant="primary" className={className} {...props}>{children}</Button>;
}