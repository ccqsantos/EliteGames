import React, { useEffect, useState } from "react";
import axios from "axios";

import "../css/Preferences.css";

const FreelancerPreferences = () => {

    const [formData, setFormData] = useState({
        professionalArea: "",
        description: "",
        averageServicePrice: "",
        yearsOfExperience: "",
        availability: "",
        skills: "",
        category: "",
        portfolioLink: ""
    });

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    useEffect(() => {

        loadPreferences();

    }, []);

    const loadPreferences = async () => {

        try {

            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await axios.get(
                "http://localhost:8080/freelancer-preferences",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data) {

                setFormData({
                    professionalArea: response.data.professionalArea || "",
                    description: response.data.description || "",
                    averageServicePrice: response.data.averageServicePrice || "",
                    yearsOfExperience: response.data.yearsOfExperience || "",
                    availability: response.data.availability || "",
                    skills: response.data.skills || "",
                    category: response.data.category || "",
                    portfolioLink: response.data.portfolioLink || ""
                });
            }

        } catch (error) {

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

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:8080/freelancer-preferences",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage("Preferências salvas com sucesso.");
            setMessageType("success");

        } catch (error) {

            console.log(error);

            setMessage("Erro ao salvar preferências.");
            setMessageType("error");
        }
    };

    return (
        <div className="preferences-page">

            <div className="preferences-container">

                <h1 className="preferences-title">
                    Preferências Profissionais
                </h1>

                <p className="preferences-subtitle">
                    Configure informações profissionais que serão exibidas
                    no seu perfil freelancer.
                </p>

                <form
                    className="preferences-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-section">

                        <label>
                            Área de atuação
                        </label>

                        <input
                            type="text"
                            name="professionalArea"
                            placeholder="Ex: Desenvolvimento Web"
                            value={formData.professionalArea}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-section">

                        <label>
                            Descrição profissional
                        </label>

                        <textarea
                            name="description"
                            placeholder="Descreva sua experiência profissional..."
                            value={formData.description}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-grid">

                        <div className="form-section">

                            <label>
                                Valor médio por serviço (R$)
                            </label>

                            <input
                                type="number"
                                name="averageServicePrice"
                                placeholder="150"
                                value={formData.averageServicePrice}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-section">

                            <label>
                                Anos de experiência
                            </label>

                            <input
                                type="number"
                                name="yearsOfExperience"
                                placeholder="5"
                                value={formData.yearsOfExperience}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    <div className="form-section">

                        <label>
                            Disponibilidade
                        </label>

                        <select
                            name="availability"
                            value={formData.availability}
                            onChange={handleChange}
                        >
                            <option value="">
                                Selecione
                            </option>

                            <option value="FULL_TIME">
                                Tempo Integral
                            </option>

                            <option value="PART_TIME">
                                Meio Período
                            </option>

                            <option value="FREELANCE">
                                Freelance
                            </option>

                            <option value="WEEKENDS">
                                Apenas Fins de Semana
                            </option>
                        </select>

                    </div>

                    <div className="form-section">

                        <label>
                            Skills
                        </label>

                        <input
                            type="text"
                            name="skills"
                            placeholder="React, Spring Boot, UI/UX..."
                            value={formData.skills}
                            onChange={handleChange}
                        />

                        <span className="skills-helper">
                            Separe as habilidades por vírgula.
                        </span>

                    </div>

                    <div className="form-section">

                        <label>
                            Categoria:
                        </label>

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="">
                                Selecione
                            </option>

                            <option value="PROGRAMMING">
                                Programação
                            </option>

                            <option value="VIDEO">
                                Vídeo
                            </option>

                            <option value="MARKETING">
                                Marketing
                            </option>

                            <option value="WRITING">
                                Escrita
                            </option>

                            <option value="ART">
                                Arte
                            </option>

                            <option value="OTHER">
                                Outro
                            </option>
                        </select>

                    </div>

                    <div className="form-section">

                        <label>
                            Link do Portfólio
                        </label>

                        <input
                            type="text"
                            name="portfolioLink"
                            placeholder="https://meuportfolio.com"
                            value={formData.portfolioLink}
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
                        className={`preferences-message ${messageType}`}
                    >
                        {message}
                    </div>
                )}

            </div>

        </div>
    );
};

export default FreelancerPreferences;