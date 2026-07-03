// GIAE Chile v6
// Motor de Puesta a Tierra
// Basado en RIC 6.
// No reemplaza mediciones en terreno.

const ENGINE_VERSION = "1.0.0";

function n(v,d=0){
    const x=Number(v);
    return Number.isFinite(x)?x:d;
}

function round(v,d=2){
    return Number(Number(v).toFixed(d));
}

function conductorPE(phaseSection){
    if(phaseSection<=16) return phaseSection;
    if(phaseSection<=35) return 16;
    return round(phaseSection/2,1);
}

function conductorGround(sectionPE){
    return Math.max(16,sectionPE);
}

function suggestedRod(resistivity){
    if(resistivity<=100){
        return {
            quantity:1,
            diameter:"5/8\"",
            length:"2.4 m"
        };
    }

    if(resistivity<=300){
        return {
            quantity:2,
            diameter:"5/8\"",
            length:"2.4 m"
        };
    }

    return{
        quantity:3,
        diameter:"5/8\"",
        length:"3 m"
    };
}
function groundingObservations(project, pe, electrode, measuredOhm){
    const obs = [];

    if(!project.grounding && !project.puestaTierra){
        obs.push({ level:"medio", message:"No existe diseño de puesta a tierra registrado." });
    }

    if(!measuredOhm){
        obs.push({ level:"medio", message:"No existe medición real de resistencia de puesta a tierra. El cálculo es preliminar." });
    }

    if(measuredOhm && measuredOhm > 20){
        obs.push({ level:"alto", message:"La resistencia de puesta a tierra medida es alta. Requiere revisión en terreno." });
    }

    return obs;
}

function normativeTrace(){
    return [
        { source:"RIC 6", rule:"Puesta a tierra", result:"Sistema de puesta a tierra considerado." },
        { source:"RIC 6", rule:"Conductor PE", result:"Conductor de protección calculado según sección de fase." },
        { source:"RIC 6", rule:"Equipotencialidad", result:"Se considera barra PE y unión equipotencial." }
    ];
}

export function calculateGroundingProject(project = {}){
    const grounding = project.grounding || project.puestaTierra || {};
    const phaseSection = n(project.mainConductorSectionMm2 || project.conductorSectionMm2 || grounding.phaseSectionMm2, 6);
    const resistivity = n(grounding.soilResistivity || grounding.resistividadTerreno, 100);
    const measuredOhm = n(grounding.measuredOhm || grounding.resistenciaMedida, 0);

    const pe = conductorPE(phaseSection);
    const electrodeConductor = conductorGround(pe);
    const electrode = suggestedRod(resistivity);
    const observations = groundingObservations(project, pe, electrode, measuredOhm);

    return {
        version: ENGINE_VERSION,
        generatedAt: new Date().toLocaleString("es-CL"),
        source: "Motor de Puesta a Tierra RIC 6",
        status: observations.some(o => o.level === "alto") ? "Requiere revisión" : "Validado preliminar",
        summary:{
            phaseSectionMm2: phaseSection,
            peSectionMm2: pe,
            electrodeConductorMm2: electrodeConductor,
            measuredOhm,
            soilResistivity: resistivity
        },
        electrode,
        peConductors:[
            {
                item:"Conductor PE",
                sectionMm2: pe,
                material:"Cobre",
                status:"Propuesto"
            },
            {
                item:"Conductor hacia electrodo",
                sectionMm2: electrodeConductor,
                material:"Cobre",
                status:"Propuesto"
            }
        ],
        equipotentialBonding:[
            {
                item:"Barra PE",
                required:true,
                status:"Requerida"
            },
            {
                item:"Unión equipotencial principal",
                required:true,
                status:"Requerida"
            }
        ],
        materials:[
            { family:"Puesta a tierra", item:`Electrodo copperweld ${electrode.diameter} x ${electrode.length}`, qty:electrode.quantity, unit:"un" },
            { family:"Conductor", item:`Conductor PE cobre ${pe} mm²`, qty:1, unit:"gl" },
            { family:"Conductor", item:`Conductor electrodo cobre ${electrodeConductor} mm²`, qty:1, unit:"gl" },
            { family:"Tablero", item:"Barra PE", qty:1, unit:"un" }
        ],
        observations,
        normativeTrace: normativeTrace()
    };
}

export default calculateGroundingProject;