import React, { useEffect, useState } from "react";

import axios from "axios";

import "../css/Preferences.css";

const API_URL = "http://localhost:8080";

const ClientPreferences = () => {

    const [formData, setFormData] = useState({

        companyName: "",
        companyDescription: "",
        hiringArea: "",
        budgetRange: "",
        preferredSkills: "",
        projectType: "",
        workMode: "",
        companyWebsite: ""

    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState("");

    useEffect(() => {

        loadPreferences();

    }, []);

    const loadPreferences = async () => {

        try {

            const token = localStorage.getItem(
                "token"
            );

            const response = await axios.get(
                `${API_URL}/client-preferences`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data) {

                setFormData({

                    companyName:
                        response.data.companyName || "",

                    companyDescription:
                        response.data.companyDescription || "",

                    hiringArea:
                        response.data.hiringArea || "",

                    budgetRange:
                        response.data.budgetRange || "",

                    preferredSkills:
                        response.data.preferredSkills || "",

                    projectType:
                        response.data.projectType || "",

                    workMode:
                        response.data.workMode || "",

                    companyWebsite:
                        response.data.companyWebsite || ""

                });

            }

        } catch (error) {

            console.log(
                "Erro ao carregar preferências:"
            );

            console.log(error);

        }

    };

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem(
                "token"
            );

            await axios.post(
                `${API_URL}/client-preferences`,
                formData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setMessage(
                "Preferências salvas com sucesso."
            );

            setMessageType("success");

        } catch (error) {

            console.log(error);

            setMessage(
                "Erro ao salvar preferências."
            );

            setMessageType("error");

        }

    };

    return (

        <div className="preferences-page">

            <div className="preferences-container">

                <h1 className="preferences-title">
                    Preferências do Cliente
                </h1>

                <p className="preferences-subtitle">
                    Configure as informações da sua
                    empresa e preferências de
                    contratação para encontrar os
                    melhores freelancers.
                </p>

                <form
                    className="preferences-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-section">

                        <label>
                            Nome da empresa
                        </label>

                        <input
                            type="text"
                            name="companyName"
                            placeholder="Ex: Tech Solutions"
                            value={formData.companyName}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-section">

                        <label>
                            Descrição da empresa
                        </label>

                        <textarea
                            name="companyDescription"
                            placeholder="Descreva sua empresa..."
                            value={
                                formData.companyDescription
                            }
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-grid">

                        <div className="form-section">

                            <label>
                                Área de contratação
                            </label>

                            <input
                                type="text"
                                name="hiringArea"
                                placeholder="Ex: Desenvolvimento Web"
                                value={formData.hiringArea}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-section">

                            <label>
                                Faixa de orçamento
                            </label>

                            <input
                                type="text"
                                name="budgetRange"
                                placeholder="Ex: R$ 5.000 - R$ 10.000"
                                value={formData.budgetRange}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    <div className="form-grid">

                        <div className="form-section">

                            <label>
                                Tipo de projeto
                            </label>

                            <input
                                type="text"
                                name="projectType"
                                placeholder="Ex: Projeto contínuo"
                                value={formData.projectType}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-section">

                            <label>
                                Modalidade de trabalho
                            </label>

                            <select
                                name="workMode"
                                value={formData.workMode}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Selecione
                                </option>

                                <option value="REMOTE">
                                    Remoto
                                </option>

                                <option value="HYBRID">
                                    Híbrido
                                </option>

                                <option value="PRESENTIAL">
                                    Presencial
                                </option>

                            </select>

                        </div>

                    </div>

                    <div className="form-section">

                        <label>
                            Skills desejadas
                        </label>

                        <input
                            type="text"
                            name="preferredSkills"
                            placeholder="React, Node.js, UI/UX..."
                            value={
                                formData.preferredSkills
                            }
                            onChange={handleChange}
                        />

                        <span className="skills-helper">
                            Separe as skills por vírgula.
                        </span>

                    </div>

                    <div className="form-section">

                        <label>
                            Website da empresa
                        </label>

                        <input
                            type="text"
                            name="companyWebsite"
                            placeholder="https://suaempresa.com"
                            value={
                                formData.companyWebsite
                            }
                            onChange={handleChange}
                        />

                    </div>

                    <div className="preferences-actions">

                        <button
                            type="submit"
                            className="btn-save-preferences"
                        >
                            Salvar Preferências
                        </button>

                    </div>

                </form>

                {message && (

                    <div
                        className={
                            `preferences-message ${messageType}`
                        }
                    >
                        {message}
                    </div>

                )}

            </div>

        </div>

    );

};

export default ClientPreferences;