import { Link, useLocation } from 'react-router-dom';


const navigationItems = [
  { path: '/', label: 'Home' },
  { path: '/user-service', label: 'User Service' },
  { path: '/tool-service', label: 'Tool Service' },
  { path: '/content-service', label: 'Content Service' },
  { path: '/groupchat-service', label: 'Groupchat Service' },
  { path: '/agenda-service', label: 'Agenda Service' },
];

const Navigation = () => {
    const location = useLocation();

    return (
        <nav className="bg-white border-b w-full">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="font-medium text-xl text-gray-800">PTSS CMS Demo</div>
                    <ul className="flex space-x-8">
                        {navigationItems.map(item => (
                            <li key={item.path}>
                                <Link 
                                    to={item.path} 
                                    className={`text-gray-600 hover:text-gray-900 ${
                                        location.pathname === item.path ? 'font-bold' : ''
                                    }`}
                                >
                                {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;