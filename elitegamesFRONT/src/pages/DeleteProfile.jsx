import React, { useEffect, useState } from "react";

import axios from "axios";

import "../css/DeleteProfile.css";

const DeleteProfile = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [loadingProfile, setLoadingProfile] = useState(true);

    const [confirmationText, setConfirmationText] = useState("");

    const [loadingDelete, setLoadingDelete] = useState(false);

    const [message, setMessage] = useState("");

    const [userData, setUserData] = useState(null);

    useEffect(() => {

        const validateUser = async () => {

            try {

                const token = localStorage.getItem("token");

                if (!token) {

                    setIsLoggedIn(false);

                    setLoadingProfile(false);

                    return;
                }

                const response = await axios.get(
                    "http://localhost:8080/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUserData(response.data);

                setIsLoggedIn(true);

            } catch (error) {

                console.log(error);

                localStorage.removeItem("token");

                setIsLoggedIn(false);

            } finally {

                setLoadingProfile(false);
            }
        };

        validateUser();

    }, []);

    const handleDelete = async () => {

        if (confirmationText !== "EXCLUIR") {

            setMessage(
                "Digite EXCLUIR para confirmar."
            );

            return;
        }

        try {

            setLoadingDelete(true);

            const token = localStorage.getItem("token");

            await axios.delete(
                "http://localhost:8080/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            localStorage.removeItem("token");

            setMessage(
                "Conta excluída com sucesso."
            );

            setTimeout(() => {

                window.location.href = "/";

            }, 2000);

        } catch (error) {

            console.log(error);

            setMessage(
                "Erro ao excluir conta."
            );

        } finally {

            setLoadingDelete(false);
        }
    };

    if (loadingProfile) {

        return (

            <div className="delete-profile-page">

                <div className="delete-profile-card">

                    <h2>
                        Carregando...
                    </h2>

                </div>

            </div>
        );
    }

    if (!isLoggedIn) {

        return (

            <div className="delete-profile-page">

                <div className="delete-profile-card">

                    <h1>
                        Acesso Negado
                    </h1>

                    <p className="warning-text">

                        Você precisa estar logado
                        para acessar esta página.

                    </p>

                    <button
                        className="btn-delete-profile"
                        onClick={() => {
                            window.location.href = "/login";
                        }}
                    >
                        Fazer Login
                    </button>

                </div>

            </div>
        );
    }

    return (

        <div className="delete-profile-page">

            <div className="delete-profile-card">

                <h1>
                    Excluir Conta
                </h1>

                <p className="warning-text">

                    Você está prestes a excluir permanentemente
                    a conta de:

                </p>

                <div className="user-delete-info">

                    <strong>
                        {userData?.name}
                    </strong>
                    <br/>
                    <span>
                        {userData?.email}
                    </span>

                </div>

                <p className="warning-text">

                    Todos os seus dados serão removidos:

                </p>

                <ul className="delete-list">

                    <li>
                        Perfil da conta
                    </li>

                    <li>
                        Preferências profissionais
                    </li>

                    <li>
                        Dados pessoais
                    </li>

                </ul>

                <p className="confirmation-text">

                    Digite EXCLUIR para confirmar.

                </p>

                <input
                    type="text"
                    className="delete-input"
                    placeholder="EXCLUIR"
                    value={confirmationText}
                    onChange={(e) =>
                        setConfirmationText(
                            e.target.value
                        )
                    }
                />

                <button
                    className="btn-delete-profile"
                    onClick={handleDelete}
                    disabled={loadingDelete}
                >

                    {loadingDelete
                        ? "Excluindo..."
                        : "Excluir Conta"
                    }

                </button>

                {message && (

                    <div className="delete-message">

                        {message}

                    </div>

                )}

            </div>

        </div>
    );
};

export default DeleteProfile;