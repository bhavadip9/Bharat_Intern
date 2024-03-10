import { useLocation } from "react-router-dom";
const Home = () => {
    const location = useLocation();
    return (
        <div className="homepage">
            <h1>Hello and Welcome to the home Page </h1>
            {location.state.id}
        </div>
    );
};

export default Home;