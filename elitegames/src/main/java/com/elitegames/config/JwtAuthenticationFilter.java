package com.elitegames.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication
        .UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context
        .SecurityContextHolder;

import org.springframework.security.core.userdetails
        .UserDetails;

import org.springframework.security.core.userdetails
        .UserDetailsService;

import org.springframework.stereotype.Component;

import org.springframework.web.filter
        .OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private final UserDetailsService
            userDetailsService;

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {

        String path =
                request.getServletPath();

        return path.startsWith("/auth/")
                || path.startsWith("/h2-console");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    )
            throws ServletException,
            IOException {

        String authHeader =
                request.getHeader(
                        "Authorization"
                );

        /*
         * Se não tiver Bearer Token,
         * segue normalmente.
         */
        if (
                authHeader == null
                        || !authHeader.startsWith(
                        "Bearer "
                )
        ) {

            chain.doFilter(
                    request,
                    response
            );

            return;
        }

        String token =
                authHeader.substring(7);

        /*
         * Verifica validade do token
         */
        if (!jwtUtil.isTokenValid(token)) {

            chain.doFilter(
                    request,
                    response
            );

            return;
        }

        /*
         * Extrai email do token
         */
        String email =
                jwtUtil.extractEmail(token);

        UserDetails userDetails =
                userDetailsService
                        .loadUserByUsername(
                                email
                        );

        UsernamePasswordAuthenticationToken
                authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        authentication
                );

        chain.doFilter(
                request,
                response
        );
    }
}