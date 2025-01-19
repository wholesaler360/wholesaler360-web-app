import { useLocation } from 'react-router-dom';

export const useBreadcrumbs = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    // Remove leading slash and split path into segments
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Transform segments into breadcrumb items
    const breadcrumbs = pathSegments.map((segment, index) => {
      // Create partial path for each breadcrumb
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      
      // Format segment text (convert-this-format to This This Format)
      const text = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        text,
        path,
        isLast: index === pathSegments.length - 1
      };
    });

    return breadcrumbs;
  };

  return getBreadcrumbs();
};
