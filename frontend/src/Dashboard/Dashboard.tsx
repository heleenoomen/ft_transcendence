import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup, faUser } from '@fortawesome/free-solid-svg-icons'
import Header from "../Header/Header";
import axios from 'axios';
import './Dashboard.css'
import Cookies from 'js-cookie';

const Dashboard = () => {

	const cookie = Cookies.get('session');
	const navigate = useNavigate();

	const [username, setUsername] = useState('');

	useEffect(() => {

		const getUsername = async () => {
			try {
				const response = await axios.post('http://localhost:5000/auth/get_data', { cookie });
				setUsername(response.data.username);
			} catch (error) {
				console.log(error);
			}
		}

		if (!cookie)
			navigate('/not-logged');
		else
			getUsername();
	}, [navigate, cookie]);

	return (
		<div className="bg">
			<Header />
			<div className="dashboard-cont">
				<section className='user-sec'>
					<div className='side-sec' onClick={() => {navigate('/friends');}}>
						<FontAwesomeIcon className="icon" icon={faUserGroup} size="5x" color='#476cd2c9'/>
						<h1>Friends</h1>
					</div>
					<div className='logout-sec'>
						<h1>{username}</h1>
					</div>
					<div className='side-sec' onClick={() => {navigate('/profile');}}>
						<FontAwesomeIcon className="icon" icon={faUser} size="5x" color='#476cd2c9'/>
						<h1>Profile</h1>
					</div>
				</section>
				<section>
					<h1>Play game!</h1>
					<Link className="link-btn" to='/game'>Start</Link>
				</section>
				<section>
					<h1>See game statistics...</h1>
					<Link className="link-btn" to='/stats'>Open</Link>
				</section>
				<section>
					<h1>Find Friends</h1>
					<Link className="link-btn" to='/search'>Search</Link>
				</section>
				<section>
					<h1>Chat with someone!</h1>
					<Link className="link-btn" to='/chat'>Open</Link>
				</section>
			</div>
		</div>
	);
};

export default Dashboard;