import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login } from './AuthSlice';
import './Form.css'

const CLIENT_ID = process.env.REACT_APP_ID;
const REDIRECT_URI = 'http://localhost:3000/form';
const SECRET = process.env.REACT_APP_SECRET;

const Form = () => 
{
	const [accessToken, setAccessToken] = useState('');
	const [signInError, setSignInError] = useState('');
	const [signUpError, setSignUpError] = useState('');
	const [switchUp, setSwitchUp] = useState(false);
	const [file, setFile] = useState(null);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const navigate = useNavigate();
	const dispatch = useDispatch();

	const handleFileChange = (event:any) => {
		setFile(event.target.files[0]);
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		
		if (code) {
			axios.post('https://api.intra.42.fr/oauth/token', {
				grant_type: 'authorization_code',
				client_id: CLIENT_ID,
				client_secret: SECRET,
				code: code,
				redirect_uri: REDIRECT_URI
			})
			.then(response => {
				setAccessToken(response.data.access_token);
			})
			.catch(error => {
				console.error(error);
			});}
		
		navigate('');
	}, []);

	const sendSignUpData = async (event:any) => {
		event.preventDefault();
		if (accessToken)
		{
			try {
				const formData = new FormData();
				if (file)
					formData.append('image', file);
				const response = await axios.post('http://localhost:5000/auth/signup', {
				  username: username,
				  password: password,
				  token: accessToken,
				  profile_picture: formData
				});
				if (response.data.status === 201)
				{
					dispatch(login());
					navigate('/');
				}
				else
					setSignUpError(response.data.message);
			} catch (error) {
				console.error(error);
			}
		}
	}

	const sendSignInData = async (event:any) => {
		event.preventDefault();
		try {
			const response = await axios.post('http://localhost:5000/auth/signin', {
				username: username,
				password: password,
				token: accessToken
			});
			if (response.data.status === 200)
			{
				dispatch(login());
				navigate('/');
			}
			else
				setSignInError(response.data.message);
		} catch (error) {
			console.error(error);
		}
	}

	const handleSwitch = () => {
		setSwitchUp(!switchUp);
	  };

	const cont_style = {
		height: switchUp ? '100vh' : '40rem',
	};

	const handleUsernameChange = (event:any) => {
		setUsername(event.target.value);
	}

	const handlePasswordChange = (event:any) => {
		setPassword(event.target.value);
	}

	return (
		<div className='bg' style={{paddingTop: 0, height: '100vh'}}>
		<div className='form-cont' style={cont_style}>
			{ switchUp ? (
			<form name="signup" className='signup-form'>
				<h1>Sign Up</h1>
				{signUpError && <h2>{signUpError}</h2>}
				<div className='img-cont'>
				{file && <img src={URL.createObjectURL(file)} alt="uploaded-img" />}
				</div>
				<label className='label-pic'>
					Upload Profile Picture
					<input type="file" name="pic" onChange={handleFileChange}/>
				</label>
				<label className='label-text'>
					Username:
					<input className='input-text' type="text" name="name" value={username} onChange={handleUsernameChange} />
				</label>
				<label className='label-text'>
					Password:
					<input className='input-text' type="password" name="pass" value={password} onChange={handlePasswordChange}/>
				</label>
				<label className='submit-lbl'>
					<input className='submit-btn' type="submit" onClick={sendSignUpData}/>
				</label>
			</form>
			) : (
			<form name="signin" className='signin-form'>
				<h1>Sign In</h1>
				{signInError && <h2>{signInError}</h2>}
				<label className='label-text'>
					Username:
					<input className='input-text' type="text" name="name" value={username} onChange={handleUsernameChange}/>
				</label>
				<label className='label-text'>
					Password:
					<input className='input-text' type="password" name="pass" value={password} onChange={handlePasswordChange}/>
				</label>
				<label className='submit-lbl'>
					<input className='submit-btn' type="submit" onClick={sendSignInData}/>
				</label>
			</form>
			)}
			<label className="switch">
				<input type="checkbox" onChange={handleSwitch}/>
				<span className="slider"></span>
			</label>
		</div>
		</div>
	)
}

export default Form;