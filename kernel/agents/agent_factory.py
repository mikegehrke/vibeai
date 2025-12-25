# kernel/agents/agent_factory.py
# --------------------------------
# Agent Factory - Dynamische Agent-Erstellung (Phase 1A)
#
# PHILOSOPHIE:
# - Agenten sind DATEN, nicht Code
# - User kann Agenten für JEDEN Bereich erstellen
# - Templates statt Hard-Coding
# - Capabilities-basiert
#
# VORTEILE:
# - Buchhaltungs-Agent? ✅
# - Fitness-Agent? ✅
# - Rechts-Agent? ✅
# - Lern-Agent? ✅
# → Keine Code-Änderung nötig!

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Set
from enum import Enum
import json
import time


class AgentCapability(Enum):
    """
    Agent-Fähigkeiten (erweiterbar).
    
    CODE:
        - file_create, file_update, code_analysis
    
    TERMINAL:
        - terminal_exec, process_monitor
    
    GIT:
        - git_clone, git_commit, git_push
    
    WEB:
        - web_scrape, api_call, browser_control
    
    IMAGE:
        - image_generate, image_analyze
    
    DATA:
        - data_analysis, chart_generate
    
    CUSTOM:
        - Für User-definierte Fähigkeiten
    """
    # Code
    FILE_CREATE = "file_create"
    FILE_UPDATE = "file_update"
    FILE_DELETE = "file_delete"
    CODE_ANALYSIS = "code_analysis"
    CODE_REFACTOR = "code_refactor"
    
    # Terminal
    TERMINAL_EXEC = "terminal_exec"
    PROCESS_MONITOR = "process_monitor"
    
    # Git
    GIT_CLONE = "git_clone"
    GIT_COMMIT = "git_commit"
    GIT_PUSH = "git_push"
    GIT_DIFF = "git_diff"
    
    # Web
    WEB_SCRAPE = "web_scrape"
    API_CALL = "api_call"
    BROWSER_CONTROL = "browser_control"
    
    # Media
    IMAGE_GENERATE = "image_generate"
    IMAGE_ANALYZE = "image_analyze"
    VIDEO_ANALYZE = "video_analyze"
    
    # Data
    DATA_ANALYSIS = "data_analysis"
    CHART_GENERATE = "chart_generate"
    SPREADSHEET_EDIT = "spreadsheet_edit"
    
    # Domain-spezifisch (Beispiele)
    ACCOUNTING = "accounting"
    LEGAL = "legal"
    FITNESS = "fitness"
    LEARNING = "learning"
    RESEARCH = "research"
    
    # Custom
    CUSTOM = "custom"


class AgentSecurityLevel(Enum):
    """Security-Level für Agenten."""
    RESTRICTED = "restricted"  # Nur lesen, keine Änderungen
    NORMAL = "normal"          # Standard-Operationen
    ELEVATED = "elevated"      # System-Operationen
    ADMIN = "admin"            # Voller Zugriff


@dataclass
class AgentTemplate:
    """
    Template für Agent-Erstellung.
    
    Attribute:
    - name: Template-Name (z.B. "Accounting Agent")
    - description: Was kann der Agent?
    - capabilities: Benötigte Capabilities
    - security_level: Sicherheits-Level
    - system_prompt: Basis-Instruktionen
    - tools: Verfügbare Tools
    - constraints: Einschränkungen
    """
    name: str
    description: str
    capabilities: Set[AgentCapability]
    security_level: AgentSecurityLevel = AgentSecurityLevel.NORMAL
    system_prompt: str = ""
    tools: List[str] = field(default_factory=list)
    constraints: Dict[str, Any] = field(default_factory=dict)
    
    # Metadata
    created_by: str = "system"
    created_at: float = field(default_factory=time.time)
    version: str = "1.0"


@dataclass
class AgentInstance:
    """
    Konkrete Agent-Instanz (aus Template erstellt).
    
    Attribute:
    - agent_id: Eindeutige ID
    - template: Verwendetes Template
    - name: Instanz-Name
    - active: Ist Agent aktiv?
    - context: Aktueller Kontext/State
    - stats: Nutzungs-Statistiken
    """
    agent_id: str
    template: AgentTemplate
    name: str
    active: bool = True
    context: Dict[str, Any] = field(default_factory=dict)
    stats: Dict[str, Any] = field(default_factory=dict)
    
    # Lifecycle
    created_at: float = field(default_factory=time.time)
    last_used: Optional[float] = None
    use_count: int = 0


class AgentFactory:
    """
    Agent Factory (Phase 1A) - Dynamische Agent-Erstellung.
    
    FEATURES:
    - Template-basierte Agent-Erstellung
    - Domain-spezifische Templates (Buchhaltung, Fitness, etc.)
    - Capability-Mapping
    - Security-Integration
    
    VERWENDUNG:
    ```python
    factory = AgentFactory()
    
    # Vordefiniertes Template
    accounting_agent = factory.create_from_template("accounting")
    
    # Custom Agent
    custom = factory.create_custom(
        name="My Research Agent",
        capabilities=[AgentCapability.WEB_SCRAPE, AgentCapability.DATA_ANALYSIS]
    )
    ```
    """
    
    def __init__(self):
        """Initialisiert Factory mit Standard-Templates."""
        self.templates: Dict[str, AgentTemplate] = {}
        self.instances: Dict[str, AgentInstance] = {}
        
        # Lade Standard-Templates
        self._load_default_templates()
    
    def _load_default_templates(self):
        """Lädt vordefinierte Templates."""
        
        # Code Development Agent
        self.register_template(AgentTemplate(
            name="Code Development Agent",
            description="Erstellt und refactored Code, analysiert Projekte",
            capabilities={
                AgentCapability.FILE_CREATE,
                AgentCapability.FILE_UPDATE,
                AgentCapability.CODE_ANALYSIS,
                AgentCapability.CODE_REFACTOR,
                AgentCapability.GIT_COMMIT
            },
            security_level=AgentSecurityLevel.NORMAL,
            system_prompt="Du bist ein Entwickler-Agent. Du schreibst sauberen, wartbaren Code.",
            tools=["file_operations", "git", "linter", "formatter"]
        ))
        
        # Accounting Agent
        self.register_template(AgentTemplate(
            name="Accounting Agent",
            description="Buchhaltung, Rechnungen, Finanzen",
            capabilities={
                AgentCapability.ACCOUNTING,
                AgentCapability.SPREADSHEET_EDIT,
                AgentCapability.DATA_ANALYSIS,
                AgentCapability.FILE_CREATE
            },
            security_level=AgentSecurityLevel.ELEVATED,  # Sensible Daten
            system_prompt="Du bist ein Buchhaltungs-Agent. Du kennst GAAP, HGB, Steuern.",
            tools=["spreadsheet", "invoice_generator", "tax_calculator"],
            constraints={
                "max_transaction": 10000,  # Beispiel
                "requires_approval": True
            }
        ))
        
        # Fitness Agent
        self.register_template(AgentTemplate(
            name="Fitness Agent",
            description="Trainingsplan, Ernährung, Tracking",
            capabilities={
                AgentCapability.FITNESS,
                AgentCapability.DATA_ANALYSIS,
                AgentCapability.CHART_GENERATE
            },
            security_level=AgentSecurityLevel.NORMAL,
            system_prompt="Du bist ein Personal Trainer. Du erstellst Trainingspläne und Ernährungstipps.",
            tools=["workout_planner", "calorie_tracker", "progress_chart"]
        ))
        
        # Legal Agent
        self.register_template(AgentTemplate(
            name="Legal Agent",
            description="Rechtsberatung, Verträge, Compliance",
            capabilities={
                AgentCapability.LEGAL,
                AgentCapability.FILE_CREATE,
                AgentCapability.RESEARCH
            },
            security_level=AgentSecurityLevel.ELEVATED,
            system_prompt="Du bist ein Rechts-Agent. Du kennst Vertragsrecht, DSGVO, AGB.",
            tools=["contract_generator", "legal_database", "compliance_checker"],
            constraints={
                "disclaimer": "Keine Rechtsberatung, nur Information",
                "requires_review": True
            }
        ))
        
        # Learning Agent
        self.register_template(AgentTemplate(
            name="Learning Agent",
            description="Lerninhalte, Quizze, Erklärungen",
            capabilities={
                AgentCapability.LEARNING,
                AgentCapability.WEB_SCRAPE,
                AgentCapability.DATA_ANALYSIS
            },
            security_level=AgentSecurityLevel.NORMAL,
            system_prompt="Du bist ein Lern-Coach. Du erstellst Lernpläne und erklärst Konzepte.",
            tools=["quiz_generator", "explanation_engine", "progress_tracker"]
        ))
        
        # Research Agent
        self.register_template(AgentTemplate(
            name="Research Agent",
            description="Web-Recherche, Fakten-Check, Zusammenfassungen",
            capabilities={
                AgentCapability.RESEARCH,
                AgentCapability.WEB_SCRAPE,
                AgentCapability.API_CALL,
                AgentCapability.DATA_ANALYSIS
            },
            security_level=AgentSecurityLevel.NORMAL,
            system_prompt="Du bist ein Recherche-Agent. Du suchst Quellen und validierst Fakten.",
            tools=["web_search", "fact_checker", "summarizer"]
        ))
    
    def register_template(self, template: AgentTemplate):
        """Registriert ein Template."""
        self.templates[template.name.lower()] = template
    
    def create_from_template(
        self,
        template_name: str,
        instance_name: Optional[str] = None,
        context: Optional[Dict] = None
    ) -> AgentInstance:
        """
        Erstellt Agent-Instanz aus Template.
        
        Args:
            template_name: Template-Name (z.B. "accounting")
            instance_name: Optionaler Instanz-Name
            context: Initial-Kontext
            
        Returns:
            AgentInstance
        """
        template_key = template_name.lower()
        
        if template_key not in self.templates:
            raise ValueError(f"Template '{template_name}' nicht gefunden")
        
        template = self.templates[template_key]
        
        # Generiere ID
        import uuid
        agent_id = str(uuid.uuid4())
        
        # Instanz-Name
        if not instance_name:
            instance_name = f"{template.name} #{len(self.instances) + 1}"
        
        # Erstelle Instanz
        instance = AgentInstance(
            agent_id=agent_id,
            template=template,
            name=instance_name,
            context=context or {},
            stats={
                "created_at": time.time(),
                "total_tasks": 0,
                "successful_tasks": 0,
                "failed_tasks": 0
            }
        )
        
        # Registriere
        self.instances[agent_id] = instance
        
        return instance
    
    def create_custom(
        self,
        name: str,
        description: str,
        capabilities: List[AgentCapability],
        security_level: AgentSecurityLevel = AgentSecurityLevel.NORMAL,
        system_prompt: str = "",
        tools: Optional[List[str]] = None
    ) -> AgentInstance:
        """
        Erstellt Custom-Agent ohne Template.
        
        Args:
            name: Agent-Name
            description: Beschreibung
            capabilities: Benötigte Capabilities
            security_level: Sicherheits-Level
            system_prompt: System-Prompt
            tools: Tools
            
        Returns:
            AgentInstance
        """
        # Erstelle temporäres Template
        template = AgentTemplate(
            name=name,
            description=description,
            capabilities=set(capabilities),
            security_level=security_level,
            system_prompt=system_prompt or f"Du bist {name}.",
            tools=tools or [],
            created_by="user"
        )
        
        # Registriere Template
        self.register_template(template)
        
        # Erstelle Instanz
        return self.create_from_template(name)
    
    def get_instance(self, agent_id: str) -> Optional[AgentInstance]:
        """Holt Agent-Instanz by ID."""
        return self.instances.get(agent_id)
    
    def list_templates(self) -> List[AgentTemplate]:
        """Listet alle verfügbaren Templates."""
        return list(self.templates.values())
    
    def list_instances(self, active_only: bool = False) -> List[AgentInstance]:
        """Listet alle Agent-Instanzen."""
        instances = list(self.instances.values())
        if active_only:
            instances = [i for i in instances if i.active]
        return instances
    
    def deactivate(self, agent_id: str):
        """Deaktiviert einen Agenten."""
        if agent_id in self.instances:
            self.instances[agent_id].active = False
    
    def activate(self, agent_id: str):
        """Aktiviert einen Agenten."""
        if agent_id in self.instances:
            self.instances[agent_id].active = True
    
    def get_stats(self) -> Dict:
        """Gibt Factory-Statistiken zurück."""
        return {
            "total_templates": len(self.templates),
            "total_instances": len(self.instances),
            "active_instances": sum(1 for i in self.instances.values() if i.active),
            "templates": [t.name for t in self.templates.values()],
            "capabilities_available": len(AgentCapability)
        }


# Singleton
_factory: Optional[AgentFactory] = None


def get_agent_factory() -> AgentFactory:
    """Gibt globale Agent Factory zurück."""
    global _factory
    if _factory is None:
        _factory = AgentFactory()
    return _factory
