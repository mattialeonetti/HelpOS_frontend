# HelpOS

HelpOS is a web application designed for UNHCR pro-bono lawyers. It's designed to store, organize, and retrieve case outcomes and corresponding legal documents. It was developed during a [UZH DSI](https://www.dsi.uzh.ch/en.html) hackathon for a class on digital platforms for resilience in crisis.

## Team

| Name | Responsibilities | Chapters of report |
|------|------------------|--------------------|
| Matteo Iulian Adam | Ideation, Backend, API | 1-3 |
| Mattia Leonetti | Ideation, Frontend logic | 4 |
| Miki Mizuki | Ideation, Frontend design | 5-7 |

## Solution Outline

The challenge was to create an application that supports lawyers retrieve legal information for individual cases faster and more reliably, so they can spend more time advising refugees.personally. Pro-bono lawyers often advise refugees situated in countries whose legal environment the lawyers are not specialised in. Thus much time is wasted on researching, translating and understanding laws, which are often fragmented agross multiple legal bodies and documents.

We designed HelpOS as a digital legal assistance platform that acts as a knowledge layer between legal documents and real refugee cases. The system stores precedents, rule interpretations, procedural outcomes, and links them to the legal basis that led to each decision. When a lawyer inputs a case, the platform recalls similar situations, highlights applicable rights, and displays relevant legal articles. Over time, the platform becomes more valuable as its repository grows. Every resolved case strengthens its future recommendations.

## Use of AI

AI tools, primarily OpenAI Codex and GitHub Copilot, were used in a limited and well-controlled manner throughout the development of HelpOS. They acted as assistive instruments during implementation without influencing the conceptual, legal, or architectural foundations of the system. 

AI was relevant only in the prototyping and implementation phases. Codex and Copilot were used to accelerate low-risk programming tasks, such as generating helper functions, scaffolding repeated backend endpoints, and producing boilerplate Vue component structures. These tools were especially useful when time constraints required rapid iteration. Their contribution was operational and not conceptual. They helped reduce development friction, but responsibility for correctness, security, and data handling remained fully with the development team. All code touching legal logic, data validation, security concerns, or schema definitions was written and reviewed manually. Copilot’s suggestions were incorporated selectively, and only when their behavior was fully understood and aligned with the system’s requirements. In practice, Copilot provided incremental improvements, such as offering completions for repetitive loops, common Spring Boot patterns, or Vue reactivity blocks, while Codex supported quick generation of minor utilities when deadlines demanded increased speed.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 21 with Spring Boot 3 |
| Database | MongoDB and Neo4j |
| Frontend | Vue with Vite.js |
| Component library | Primevue |
| Frontend store | Pinia |
