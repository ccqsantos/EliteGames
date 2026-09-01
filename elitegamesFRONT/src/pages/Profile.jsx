import React, { useEffect, useState } from 'react';

import {
    BsCameraFill,
    BsPencil,
    BsSave,
    BsX,
    BsGrid,  // Ícone para serviços
} from 'react-icons/bs';

import axios from 'axios';

import '../css/Profile.css';

import {
    Link,
    useNavigate
} from "react-router-dom";

const API_URL = "http://localhost:8080";

const Profile = () => {

    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [isEditing, setIsEditing] = useState(false);

    const [userData, setUserData] = useState(null);

    const [preferences, setPreferences] = useState(null);

    const [preferencesRoute, setPreferencesRoute] =
        useState("/preferences");

    const [editFormData, setEditFormData] = useState({
        fullName: '',
        email: ''
    });

    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {

        loadProfile();

    }, []);

    const hasPreferencesData = (prefs) => {

        if (!prefs) {
            return false;
        }

        return Object.values(prefs).some(
            value =>
                value !== null &&
                value !== undefined &&
                value !== ''
        );
    };

    const loadProfile = async () => {

        try {

            const token = localStorage.getItem("token");

            if (!token) {

                setIsLoggedIn(false);

                return;
            }

            // PROFILE

            const profileResponse = await axios.get(
                `${API_URL}/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const user = profileResponse.data;

            const formattedUser = {
                id: user.id,
                fullName: user.name,
                email: user.email,
                userType: user.role,
                memberSince: user.createdAt,
                profilePhoto: user.profilePhoto
            };

            setUserData(formattedUser);

            setEditFormData({
                fullName: formattedUser.fullName,
                email: formattedUser.email
            });

            // ROLE CONFIG

            const isFreelancer =
                user.role === "FREELANCER";

            const route = isFreelancer
                ? "/freelancer-preferences"
                : "/client-preferences";

            const endpoint = isFreelancer
                ? "/freelancer-preferences"
                : "/client-preferences";

            setPreferencesRoute(route);

            // PREFERENCES

            try {

                const preferencesResponse = await axios.get(
                    `${API_URL}${endpoint}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const preferenceData =
                    preferencesResponse.data;

                if (isFreelancer) {

                    setPreferences({
                        professionalArea:
                        preferenceData.professionalArea,

                        averagePrice:
                        preferenceData.averageServicePrice,

                        experienceLevel:
                        preferenceData.yearsOfExperience,

                        workMode:
                        preferenceData.availability,

                        description:
                        preferenceData.description,

                        portfolioLink:
                        preferenceData.portfolioLink,

                        category:
                        preferenceData.category,

                        skills:
                        preferenceData.skills
                    });

                } else {

                    setPreferences({
                        companyName:
                        preferenceData.companyName,

                        companyDescription:
                        preferenceData.companyDescription,

                        hiringArea:
                        preferenceData.hiringArea,

                        budgetRange:
                        preferenceData.budgetRange,

                        preferredSkills:
                        preferenceData.preferredSkills,

                        projectType:
                        preferenceData.projectType,

                        workMode:
                        preferenceData.workMode,

                        companyWebsite:
                        preferenceData.companyWebsite
                    });
                }

            } catch (preferencesError) {

                console.log(
                    "Erro ao carregar preferências:"
                );

                console.log(preferencesError);

                setPreferences(null);
            }

            setIsLoggedIn(true);

        } catch (error) {

            console.log(error);

            localStorage.removeItem("token");

            setIsLoggedIn(false);
        }
    };

    const handleEditChange = (e) => {

        const { name, value } = e.target;

        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleSaveEdit = async () => {

        try {

            const token = localStorage.getItem("token");

            const payload = {
                name: editFormData.fullName,
                email: editFormData.email
            };

            await axios.put(
                `${API_URL}/profile`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUserData({
                ...userData,
                fullName: editFormData.fullName,
                email: editFormData.email
            });

            setIsEditing(false);

            showSuccessMessage(
                "Perfil atualizado com sucesso!"
            );

        } catch (error) {

            console.log(error);
        }
    };

    const handleCancelEdit = () => {

        setEditFormData({
            fullName: userData.fullName,
            email: userData.email
        });

        setIsEditing(false);
    };

    const handlePhotoSelect = (e) => {

        const file = e.target.files[0];

        if (!file) {
            return;
        }

        handlePhotoUpload(file);
    };

    const handlePhotoUpload = async (file) => {

        try {

            const token = localStorage.getItem("token");

            const formData = new FormData();

            formData.append("photo", file);

            const response = await axios.post(
                `${API_URL}/profile/photo`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setUserData({
                ...userData,
                profilePhoto:
                response.data.profilePhoto
            });

            showSuccessMessage(
                "Foto de perfil atualizada!"
            );

        } catch (error) {

            console.log(error);
        }
    };

    const showSuccessMessage = (message) => {

        setSuccessMessage(message);

        setTimeout(() => {

            setSuccessMessage('');

        }, 3000);
    };

    const handleLogout = () => {

        localStorage.removeItem("token");

        setUserData(null);

        setPreferences(null);

        setIsLoggedIn(false);

        window.location.href = "/login";
    };

    // Função para navegar para a página de serviços
    const goToServices = () => {
        navigate("/services");
    };

    if (!isLoggedIn || !userData) {

        return (

            <div className="profile-page">

                <div className="profile-not-logged">

                    <div className="not-logged-card">

                        <h2>
                            Você não está logado
                        </h2>

                        <button
                            className="btn-primary"
                            onClick={() =>
                                window.location.href =
                                    "/login"
                            }
                        >
                            Fazer Login
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    return (

        <div className="profile-page">

            {successMessage && (

                <div className="success-message">
                    {successMessage}
                </div>

            )}

            <div className="profile-card">

                {/* HEADER */}

                <div className="profile-header">

                    <div className="profile-avatar-container">

                        {userData.profilePhoto ? (

                            <img
                                src={
                                    `data:image/jpeg;base64,${userData.profilePhoto}`
                                }
                                alt="Foto de perfil"
                                className="profile-avatar-image"
                            />

                        ) : (

                            <div className="profile-avatar">
                                👤
                            </div>

                        )}

                        <label
                            className="upload-photo-button"
                        >
                            <BsCameraFill className="photo-icon"/>

                            <input
                                type="file"
                                accept="image/*"
                                className="upload-photo-icon"
                                onChange={handlePhotoSelect}
                                hidden
                            />

                        </label>

                    </div>

                    <div>

                        <h1>
                            {userData.fullName}
                        </h1>

                        <p>
                            {userData.userType === 'FREELANCER' ? '💼 Freelancer' : '🏢 Cliente'}
                        </p>

                        <p>
                            Membro desde {
                            new Date(
                                userData.memberSince
                            ).toLocaleDateString(
                                'pt-BR'
                            )
                        }
                        </p>

                    </div>

                </div>

                {/* ACCOUNT SECTION */}

                <div className="profile-content">

                    <div className="section-header">

                        <h2>
                            Informações da Conta
                        </h2>

                        {!isEditing && (

                            <button
                                className="btn-edit"
                                onClick={() =>
                                    setIsEditing(true)
                                }
                            >
                                <BsPencil />
                                Editar
                            </button>

                        )}

                    </div>

                    {isEditing ? (

                        <div className="edit-form">

                            <div className="form-group">

                                <label>
                                    Nome completo
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={
                                        editFormData.fullName
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        editFormData.email
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                />

                            </div>

                            <div className="edit-actions">

                                <button
                                    className="btn-save"
                                    onClick={
                                        handleSaveEdit
                                    }
                                >
                                    <BsSave />
                                    Salvar
                                </button>

                                <button
                                    className="btn-cancel"
                                    onClick={
                                        handleCancelEdit
                                    }
                                >
                                    <BsX />
                                    Cancelar
                                </button>

                            </div>

                        </div>

                    ) : (

                        <div className="profile-details">

                            <div className="detail-row">

                                <span className="detail-label">
                                    Nome:
                                </span>

                                <span className="detail-value">
                                    {userData.fullName}
                                </span>

                            </div>

                            <div className="detail-row">

                                <span className="detail-label">
                                    Email:
                                </span>

                                <span className="detail-value">
                                    {userData.email}
                                </span>

                            </div>

                            <div className="detail-row">

                                <span className="detail-label">
                                    Tipo:
                                </span>

                                <span className="detail-value">
                                    {userData.userType === 'FREELANCER' ? 'Freelancer' : 'Cliente'}
                                </span>

                            </div>

                        </div>

                    )}

                </div>

                {/* PREFERENCES */}

                <div className="profile-content">

                    <div className="section-header">

                        <h2>
                            Preferências
                        </h2>

                    </div>

                    {hasPreferencesData(preferences) ? (

                        <div className="profile-details">

                            {userData.userType === "FREELANCER" ? (

                                <>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Área:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.professionalArea
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Valor médio:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.averagePrice
                                                    ? `R$ ${preferences.averagePrice}`
                                                    : "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Experiência:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.experienceLevel
                                                    ? `${preferences.experienceLevel} anos`
                                                    : "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Disponibilidade:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.workMode
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Skills:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.skills
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Categoria:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.category
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Portfólio:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.portfolioLink
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Descrição:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.description
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                </>

                            ) : (

                                <>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Empresa:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.companyName
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Descrição da empresa:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.companyDescription
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Área de contratação:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.hiringArea
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Faixa de orçamento:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.budgetRange
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Skills desejadas:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.preferredSkills
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Tipo de projeto:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.projectType
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Modalidade:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.workMode
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                    <div className="detail-row">

                                        <span className="detail-label">
                                            Website:
                                        </span>

                                        <span className="detail-value">
                                            {
                                                preferences.companyWebsite
                                                || "Não informado"
                                            }
                                        </span>

                                    </div>

                                </>

                            )}

                            <Link to={preferencesRoute}>

                                <button className="btn-edit">
                                    Editar Preferências
                                </button>

                            </Link>

                        </div>

                    ) : (

                        <div className="empty-preferences">

                            <p>
                                Você ainda não cadastrou
                                suas preferências.
                            </p>

                            <Link to={preferencesRoute}>

                                <button className="btn-edit">
                                    Configurar Preferências
                                </button>

                            </Link>

                        </div>

                    )}

                </div>

                {/* 🆕 SEÇÃO DE SERVIÇOS PARA FREELANCER */}

                {userData.userType === "FREELANCER" && (
                    <div className="profile-content services-section">
                        <div className="section-header">
                            <h2>Meus Serviços</h2>
                        </div>

                        <div className="services-card">
                            <div className="services-icon">📦</div>
                            <div className="services-info">
                                <h3>Gerencie seus serviços</h3>
                                <p>
                                    Crie e gerencie os serviços que você oferece para os clientes.
                                    Quanto mais serviços você criar, mais chances de conseguir novos contratos!
                                </p>
                            </div>
                            <button
                                className="btn-services"
                                onClick={goToServices}
                            >
                                <BsGrid /> Ir para Meus Serviços
                            </button>
                        </div>
                    </div>
                )}

                {/* ACTIONS */}

                <div className="profile-actions">

                    <button
                        className="btn-logout"
                        onClick={handleLogout}
                    >
                        Sair
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Profile;