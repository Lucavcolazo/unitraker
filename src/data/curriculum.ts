export type SubjectStatus = 'pending' | 'regular' | 'final' | 'approved';

export interface Subject {
    id: string;
    name: string;
    year: number;
    semester: number; // 1 or 2. 0 = anual
    credits: number;
    isAnalyst: boolean;
    correlatives: string[];
    category: string;
}

export const curriculum: Subject[] = [
    // ═══════════════════════════════════════════
    // 1º AÑO — 1º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '1-1-1', name: 'Fundamentos de Programación', year: 1, semester: 1, credits: 5, isAnalyst: true, correlatives: [], category: 'Programación' },
    { id: '1-1-2', name: 'Sistemas de Información', year: 1, semester: 1, credits: 4, isAnalyst: true, correlatives: [], category: 'Bases de Datos' },
    { id: '1-1-3', name: 'Matemática Discreta', year: 1, semester: 1, credits: 4, isAnalyst: true, correlatives: [], category: 'Matemáticas' },
    { id: '1-1-4', name: 'Álgebra I', year: 1, semester: 1, credits: 6, isAnalyst: true, correlatives: [], category: 'Matemáticas' },
    { id: '1-1-5', name: 'Introd. a la Vida Universitaria', year: 1, semester: 1, credits: 1, isAnalyst: true, correlatives: [], category: 'General' },
    { id: '1-1-6', name: 'Introd. a la Cosmovisión Bíblica', year: 1, semester: 1, credits: 2, isAnalyst: true, correlatives: [], category: 'General' },
    { id: '1-1-7', name: 'Prog. Form. Integ. I', year: 1, semester: 1, credits: 1, isAnalyst: false, correlatives: [], category: 'General' },

    // ═══════════════════════════════════════════
    // 1º AÑO — 2º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '1-2-1', name: 'Algoritmos y Estruc. de Datos', year: 1, semester: 2, credits: 6, isAnalyst: true, correlatives: ['1-1-1'], category: 'Programación' },
    { id: '1-2-2', name: 'Ingeniería del Software I', year: 1, semester: 2, credits: 4, isAnalyst: true, correlatives: ['1-1-2'], category: 'Software' },
    { id: '1-2-3', name: 'Gestión de Datos', year: 1, semester: 2, credits: 4, isAnalyst: true, correlatives: [], category: 'Bases de Datos' },
    { id: '1-2-4', name: 'Álgebra II', year: 1, semester: 2, credits: 6, isAnalyst: false, correlatives: ['1-1-4'], category: 'Matemáticas' },
    { id: '1-2-5', name: 'Antropología Bíblica', year: 1, semester: 2, credits: 2, isAnalyst: true, correlatives: [], category: 'General' },

    // ═══════════════════════════════════════════
    // 2º AÑO — 1º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '2-1-1', name: 'Programación I', year: 2, semester: 1, credits: 5, isAnalyst: true, correlatives: ['1-2-1'], category: 'Programación' },
    { id: '2-1-2', name: 'Ingeniería del Software II', year: 2, semester: 1, credits: 6, isAnalyst: true, correlatives: ['1-2-2'], category: 'Software' },
    { id: '2-1-3', name: 'Gestión Avanzada de Datos', year: 2, semester: 1, credits: 3, isAnalyst: true, correlatives: ['1-2-3'], category: 'Bases de Datos' },
    { id: '2-1-4', name: 'Arq. y Org. de Computadoras', year: 2, semester: 1, credits: 4, isAnalyst: true, correlatives: [], category: 'Hardware' },
    { id: '2-1-5', name: 'Física I', year: 2, semester: 1, credits: 2, isAnalyst: false, correlatives: [], category: 'Física' },
    { id: '2-1-6', name: 'Análisis Matemático I', year: 2, semester: 1, credits: 4, isAnalyst: false, correlatives: ['1-2-4'], category: 'Matemáticas' },
    { id: '2-1-7', name: 'Fundamentos del Cristianismo', year: 2, semester: 1, credits: 2, isAnalyst: true, correlatives: [], category: 'General' },

    // ═══════════════════════════════════════════
    // 2º AÑO — 2º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '2-2-1', name: 'Programación II', year: 2, semester: 2, credits: 4, isAnalyst: true, correlatives: ['2-1-1'], category: 'Programación' },
    { id: '2-2-2', name: 'Ingeniería del Software III', year: 2, semester: 2, credits: 4, isAnalyst: true, correlatives: ['2-1-2'], category: 'Software' },
    { id: '2-2-3', name: 'Paradigmas de Programación', year: 2, semester: 2, credits: 4, isAnalyst: true, correlatives: ['1-1-1'], category: 'Programación' },
    { id: '2-2-4', name: 'Sistemas Operativos I', year: 2, semester: 2, credits: 6, isAnalyst: true, correlatives: [], category: 'Sistemas' },
    { id: '2-2-5', name: 'Física II', year: 2, semester: 2, credits: 3, isAnalyst: false, correlatives: ['2-1-5'], category: 'Física' },
    { id: '2-2-6', name: 'Análisis Matemático II', year: 2, semester: 2, credits: 4, isAnalyst: false, correlatives: ['2-1-6'], category: 'Matemáticas' },
    { id: '2-2-7', name: 'Prog. Form. Integ. II', year: 2, semester: 2, credits: 1, isAnalyst: false, correlatives: ['1-1-7'], category: 'General' },
    { id: '2-2-8', name: 'Principios Bíblicos p/ Vida Saludable', year: 2, semester: 2, credits: 2, isAnalyst: true, correlatives: [], category: 'General' },

    // ═══════════════════════════════════════════
    // 3º AÑO — 1º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '3-1-1', name: 'Programación III', year: 3, semester: 1, credits: 5, isAnalyst: true, correlatives: ['2-2-1'], category: 'Programación' },
    { id: '3-1-2', name: 'Informática Aplicada I', year: 3, semester: 1, credits: 3, isAnalyst: true, correlatives: ['2-1-3', '2-2-2', '2-2-1'], category: 'Software' },
    { id: '3-1-3', name: 'Redes y Telecomunicaciones I', year: 3, semester: 1, credits: 6, isAnalyst: true, correlatives: ['2-1-5', '2-2-4'], category: 'Redes' },
    { id: '3-1-4', name: 'Física III', year: 3, semester: 1, credits: 4, isAnalyst: false, correlatives: ['2-2-5'], category: 'Física' },
    { id: '3-1-5', name: 'Análisis Matemático III', year: 3, semester: 1, credits: 3, isAnalyst: false, correlatives: ['2-2-6'], category: 'Matemáticas' },
    { id: '3-1-6', name: 'Responsabilidad Social y Serv. Comunitario', year: 3, semester: 1, credits: 2, isAnalyst: true, correlatives: [], category: 'General' },

    // ═══════════════════════════════════════════
    // 3º AÑO — 2º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '3-2-1', name: 'Programación IV', year: 3, semester: 2, credits: 5, isAnalyst: true, correlatives: ['3-1-1'], category: 'Programación' },
    { id: '3-2-2', name: 'Informática Aplicada II', year: 3, semester: 2, credits: 3, isAnalyst: true, correlatives: ['3-1-2'], category: 'Software' },
    { id: '3-2-3', name: 'Ética Profesional', year: 3, semester: 2, credits: 2, isAnalyst: true, correlatives: [], category: 'General' },
    { id: '3-2-4', name: 'Redes y Telecomunicaciones II', year: 3, semester: 2, credits: 6, isAnalyst: true, correlatives: ['3-1-3'], category: 'Redes' },
    { id: '3-2-5', name: 'Física IV', year: 3, semester: 2, credits: 4, isAnalyst: false, correlatives: ['3-1-4'], category: 'Física' },
    { id: '3-2-6', name: 'Cálculo Numérico', year: 3, semester: 2, credits: 3, isAnalyst: false, correlatives: ['3-1-5'], category: 'Matemáticas' },
    { id: '3-2-7', name: 'Prog. Form. Integ. III', year: 3, semester: 2, credits: 1, isAnalyst: false, correlatives: ['2-2-7'], category: 'General' },
    { id: '3-2-8', name: 'Interpretación Bíblica de la Historia', year: 3, semester: 2, credits: 2, isAnalyst: true, correlatives: [], category: 'General' },

    // ═══════════════════════════════════════════
    // 4º AÑO — 1º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '4-1-1', name: 'Administración de Recursos Informáticos', year: 4, semester: 0, credits: 4, isAnalyst: false, correlatives: ['3-2-4'], category: 'Gestión' },
    { id: '4-1-2', name: 'Teoría de la Computación', year: 4, semester: 1, credits: 4, isAnalyst: false, correlatives: ['2-1-4'], category: 'Teoría' },
    { id: '4-1-3', name: 'Comunicación en Inglés', year: 4, semester: 1, credits: 2, isAnalyst: false, correlatives: [], category: 'Idiomas' },
    { id: '4-1-4', name: 'Redes y Telecomunicaciones III', year: 4, semester: 1, credits: 4, isAnalyst: false, correlatives: ['3-2-4'], category: 'Redes' },
    { id: '4-1-5', name: 'Tecnología Eléctrica y Electrónica', year: 4, semester: 1, credits: 4, isAnalyst: false, correlatives: ['3-2-5'], category: 'Electrónica' },
    { id: '4-1-6', name: 'Estadística Aplicada', year: 4, semester: 1, credits: 4, isAnalyst: false, correlatives: ['2-2-6'], category: 'Matemáticas' },
    { id: '4-1-7', name: 'Fe y Ciencia', year: 4, semester: 1, credits: 2, isAnalyst: false, correlatives: [], category: 'General' },

    // ═══════════════════════════════════════════
    // 4º AÑO — 2º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '4-2-1', name: 'Inteligencia Artificial', year: 4, semester: 2, credits: 5, isAnalyst: false, correlatives: ['3-2-6', '4-1-2'], category: 'IA' },
    { id: '4-2-2', name: 'Sistemas Industriales', year: 4, semester: 2, credits: 2, isAnalyst: false, correlatives: ['3-2-4', '4-1-5'], category: 'Sistemas' },
    { id: '4-2-3', name: 'Data Science', year: 4, semester: 2, credits: 4, isAnalyst: false, correlatives: ['2-1-3'], category: 'Ciencia de Datos' },
    { id: '4-2-4', name: 'Taller de Emprendedorismo', year: 4, semester: 2, credits: 4, isAnalyst: false, correlatives: [], category: 'Gestión' },
    { id: '4-2-5', name: 'Productos Digitales', year: 4, semester: 2, credits: 2, isAnalyst: false, correlatives: ['2-2-2'], category: 'Software' },
    { id: '4-2-6', name: 'Prog. Form. Integ. IV', year: 4, semester: 2, credits: 1, isAnalyst: false, correlatives: ['3-2-7'], category: 'General' },
    { id: '4-2-7', name: 'Historia del Cristianismo', year: 4, semester: 2, credits: 2, isAnalyst: false, correlatives: [], category: 'General' },

    // ═══════════════════════════════════════════
    // 5º AÑO — 1º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '5-1-1', name: 'Adm. de Bases de Datos', year: 5, semester: 1, credits: 3, isAnalyst: false, correlatives: ['4-2-3'], category: 'Bases de Datos' },
    { id: '5-1-2', name: 'Taller de Comunicación', year: 5, semester: 1, credits: 2, isAnalyst: false, correlatives: [], category: 'Idiomas' },
    { id: '5-1-3', name: 'Derecho Informático', year: 5, semester: 1, credits: 2, isAnalyst: false, correlatives: ['2-2-2'], category: 'Legal' },
    { id: '5-1-4', name: 'Sistemas Operativos II', year: 5, semester: 1, credits: 4, isAnalyst: false, correlatives: ['4-1-4'], category: 'Sistemas' },
    { id: '5-1-5', name: 'Práctica Supervisada', year: 5, semester: 0, credits: 7, isAnalyst: false, correlatives: ['4-1-1', '4-1-4', '4-2-3'], category: 'Práctica' },
    { id: '5-1-6', name: 'Relaciones Interpersonales y Des. Profesional', year: 5, semester: 1, credits: 2, isAnalyst: false, correlatives: [], category: 'Gestión' },
    { id: '5-1-7', name: 'Prog. Form. Integ. V', year: 5, semester: 1, credits: 1, isAnalyst: false, correlatives: ['4-2-6'], category: 'General' },
    { id: '5-1-8', name: 'Optativa', year: 5, semester: 0, credits: 2, isAnalyst: false, correlatives: [], category: 'Opcional' },
    { id: '5-1-9', name: 'Proyecto Final', year: 5, semester: 0, credits: 2, isAnalyst: false, correlatives: ['4-1-1', '4-2-4'], category: 'Proyecto' },

    // ═══════════════════════════════════════════
    // 5º AÑO — 2º CUATRIMESTRE
    // ═══════════════════════════════════════════
    { id: '5-2-1', name: 'Sistemas de Apoyo a la Toma de Decisiones', year: 5, semester: 2, credits: 4, isAnalyst: false, correlatives: ['5-1-1'], category: 'Sistemas' },
    { id: '5-2-2', name: 'Ciberseguridad', year: 5, semester: 2, credits: 2, isAnalyst: false, correlatives: ['4-1-4', '5-1-1', '5-1-4'], category: 'Seguridad' },
    { id: '5-2-3', name: 'Robótica y Domótica', year: 5, semester: 2, credits: 4, isAnalyst: false, correlatives: ['4-1-4', '4-2-2'], category: 'Automatización' },
    { id: '5-2-4', name: 'Auditoría Informática', year: 5, semester: 2, credits: 2, isAnalyst: false, correlatives: ['2-2-2', '3-2-4'], category: 'Seguridad' },
    { id: '5-2-5', name: 'Movimiento Religión y Sociedad', year: 5, semester: 2, credits: 2, isAnalyst: false, correlatives: [], category: 'General' },
];

// Estado inicial basado en Notion del usuario
export const initialSubjectStates: Record<string, SubjectStatus> = {
    // 1-1
    '1-1-1': 'approved',
    '1-1-2': 'approved',
    '1-1-3': 'approved',
    '1-1-4': 'final',
    '1-1-5': 'approved',
    '1-1-6': 'approved',
    '1-1-7': 'pending',
    // 1-2
    '1-2-1': 'approved',
    '1-2-2': 'approved',
    '1-2-3': 'approved',
    '1-2-4': 'pending',
    '1-2-5': 'approved',
    // 2-1
    '2-1-1': 'approved',
    '2-1-2': 'approved',
    '2-1-3': 'approved',
    '2-1-4': 'approved',
    '2-1-5': 'approved',
    '2-1-6': 'pending',
    '2-1-7': 'approved',
    // 2-2
    '2-2-1': 'approved',
    '2-2-2': 'approved',
    '2-2-3': 'pending',
    '2-2-4': 'approved',
    '2-2-5': 'final',
    '2-2-6': 'pending',
    '2-2-7': 'pending',
    '2-2-8': 'approved',
    // 3-1
    '3-1-1': 'approved',
    '3-1-2': 'approved',
    '3-1-3': 'final',
    '3-1-4': 'pending',
    '3-1-5': 'pending',
    '3-1-6': 'approved',
    // 3-2
    '3-2-1': 'approved',
    '3-2-2': 'approved',
    '3-2-3': 'approved',
    '3-2-4': 'pending',
    '3-2-5': 'pending',
    '3-2-6': 'pending',
    '3-2-7': 'pending',
    '3-2-8': 'approved',
    // 4-1
    '4-1-1': 'pending',
    '4-1-2': 'pending',
    '4-1-3': 'approved',
    '4-1-4': 'pending',
    '4-1-5': 'pending',
    '4-1-6': 'pending',
    '4-1-7': 'pending',
    // 4-2
    '4-2-1': 'pending',
    '4-2-2': 'pending',
    '4-2-3': 'pending',
    '4-2-4': 'pending',
    '4-2-5': 'pending',
    '4-2-6': 'pending',
    '4-2-7': 'pending',
    // 5-1
    '5-1-1': 'pending',
    '5-1-2': 'pending',
    '5-1-3': 'pending',
    '5-1-4': 'pending',
    '5-1-5': 'pending',
    '5-1-6': 'pending',
    '5-1-7': 'pending',
    '5-1-8': 'pending',
    '5-1-9': 'pending',
    // 5-2
    '5-2-1': 'pending',
    '5-2-2': 'pending',
    '5-2-3': 'pending',
    '5-2-4': 'pending',
    '5-2-5': 'pending',
};
