import { useLocation } from 'react-router-dom';

export function NavFooterItems({ children, className, ...props }) {
  const location = useLocation();
  
  return (
    <div 
      className={cn("grid gap-1", className)} 
      data-current-path={location.pathname} // Use data attribute instead
      {...props}
    >
      {children}
    </div>
  );
}
