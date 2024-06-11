from singleton_meta import SingletonMeta
from logger import logger
from services.llms.llm_initializer import initialize_llms
from services.prompt_templates import translation_prompt

class TranslationService(metaclass=SingletonMeta):
    def __init__(self) -> None:
        self.llms = initialize_llms()
        self.openai_llm     = self.llms[0]
        self.anthropic_llm  = self.llms[1]
        self.translation_chain = self._create_translation_chain()
        self._initialized = False

    def _create_translation_chain(self):
        chain = translation_prompt | self.openai_llm
        return chain

    def initialize(self):
        self._initialized = True

    def is_initialized(self):
        return self._initialized

    def translate(self, text_input):
        response = self.translation_chain.invoke({
            "text_input": text_input,
        })
        logger.error(response.response_metadata)
        return response.content


translation_service = TranslationService()