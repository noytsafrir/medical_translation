import React, { createContext, useReducer, useEffect } from 'react';
import translateParagraph, { saveLeafletToDB, fetchLeafletsFromDB , deleteLeafletFromDB, downloadDocFile } from '../api/Api';

export const TranslateContext = createContext();

const createNewLeaflet = () => ({
  id: Date.now(),
  name: 'Untitled Leaflet',
  date: new Date().toISOString(),
  sections: [{ id: 0, inputText: '', translation: '' }]
});

function translateReducer(state, action) {
  switch (action.type) {
    case 'SET_LEAFLETS':
      return {
        ...state,
        leaflets: (action.leaflets).sort((a, b) => new Date(b.date) - new Date(a.date))
      };
    case 'NEW_CURRENT_LEAFLET':
      return {
        ...state,
        currentLeaflet: createNewLeaflet()
      };
    case 'SET_CURRENT_LEAFLET':
    return {
      ...state,
      currentLeaflet: {...action.leaflet} 
    };
    case 'UPDATE_CURRENT_LEAFLET':
      return {
        ...state,
        currentLeaflet: { ...state.currentLeaflet, ...action.updates }
      };
    case 'ADD_SECTION':
      return {
        ...state,
        currentLeaflet: {
          ...state.currentLeaflet,
          sections: [
            ...state.currentLeaflet.sections,
            { id: state.currentLeaflet.sections.length, inputText: '', translation: '' }
          ]
        }
      };
    case 'DELETE_SECTION':
      return {
        ...state,
        currentLeaflet: {
          ...state.currentLeaflet,
          sections: state.currentLeaflet.sections.length === 1 
            ? [{ id: 0, inputText: '', translation: '' }] 
            : state.currentLeaflet.sections.filter(section => section.id !== action.sectionId)
        }
      };
    case 'CHANGE_INPUT_TEXT':
      return {
        ...state,
        currentLeaflet: {
          ...state.currentLeaflet,
          sections: state.currentLeaflet.sections.map(section =>
            section.id === action.sectionId ? { ...section, inputText: action.newText } : section
          )
        }
      };
    case 'UPDATE_OUTPUT_TEXT':
      return {
        ...state,
        currentLeaflet: {
          ...state.currentLeaflet,
          sections: state.currentLeaflet.sections.map(section =>
            section.id === action.sectionId ? { ...section, translation: action.newTranslation } : section
          )
        }
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;

  }
}

export default function TranslateContextProvider({children}) {
    const initialState = { 
      leaflets: [],
      currentLeaflet: createNewLeaflet(),
      error: null
    };
    const [state, dispatch] = useReducer(translateReducer, initialState);
  
    const dispatchError = (error, customMessage) => {
        console.error(customMessage, error);
        dispatch({ 
          type: 'SET_ERROR', 
          error: {
            message: customMessage,
            details: error.response?.data?.error_message || error.message,
            code: error.response?.status || 'UNKNOWN'
          }
        });
      };

    const fetchLeaflets = async () => {
      try {
          const fetchedLeaflets = await fetchLeafletsFromDB();
          dispatch({ type: 'SET_LEAFLETS', leaflets: fetchedLeaflets.leaflets });
      } catch (error) {
          dispatchError(error, 'Failed to fetch leaflets. Please try again.');

      }
    };

    useEffect(() => {
      fetchLeaflets();
    }, []);

    const saveLeaflet = async () => {
      if (!state.currentLeaflet) return;

      try {
        const savedCurrentLeaflet = await saveLeafletToDB(state.currentLeaflet);
        dispatch({ type: 'SET_LEAFLETS', leaflets: [...state.leaflets, savedCurrentLeaflet] });
        console.log('Leaflet saved successfully');
      } catch (error) {
        dispatchError(error, 'Failed to save leaflet. Please try again.');
      }
    };

    const getTranslation = async(text) => {
      try{
        const translate = await translateParagraph('heb', 'eng', text);
        return translate;
      }
      catch(error){
        dispatchError(error, 'Failed to translate text. Please try again.');
        return 'Error translating paragraph';
      }
    };

    const onDownloadFileClick = async () => {
      try {
        const content = generateFileContent();
        const blob = await downloadDocFile(content);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
  
        const currentDateTime = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const filename = `generated_document_${state.currentLeaflet.name}_${currentDateTime}.docx`;
        link.setAttribute('download', filename);
  
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        window.URL.revokeObjectURL(url); // Clean up the object URL
        console.info('File downloaded successfully');
      } catch (error) {
        dispatchError(error, 'Failed to download leaflet. Please try again.');
      }
    };
    
  const generateFileContent = () => {
      let allText = ``;
      state.currentLeaflet.sections.forEach((section) => {
        allText += section.translation + '<br><br>';
      });
      return allText;
  }


    const addNewLeaflet = () => {
      dispatch({ type: 'NEW_CURRENT_LEAFLET' });
    };

    const addSection = () => {
      dispatch({ type: 'ADD_SECTION' });
    };
  
    const deleteSection = (sectionId) => {
      dispatch({ type: 'DELETE_SECTION', sectionId });
    };
  
    const changeInputText = (sectionId, newText) => {
      dispatch({ type: 'CHANGE_INPUT_TEXT', sectionId, newText });
    };
  
    const updateOutputText = (sectionId, newTranslation) => {
      dispatch({ type: 'UPDATE_OUTPUT_TEXT', sectionId, newTranslation });
    };

    const handleLeafletNameChange = (newName) => {
      dispatch({ type: 'UPDATE_CURRENT_LEAFLET', updates: { name: newName } });
    };

    const selectLeaflet = (leaflet) => {
      dispatch({ type: 'SET_CURRENT_LEAFLET', leaflet });
    };

    const deleteLeaflet = async (leafletId) => {
      try {
        const result = await deleteLeafletFromDB(leafletId);
        const newLeafletsList = state.leaflets.filter(leaflet => leaflet.id !== leafletId);
        dispatch({ type: 'SET_LEAFLETS', leaflets: newLeafletsList });
        dispatch({ type: 'NEW_CURRENT_LEAFLET' });
        console.log('Leaflet deleted successfully');
      } catch (error) {
        dispatchError(error, 'Failed to delete leaflet. Please try again.');
      }
    }

    const clearError = () => {
      dispatch({ type: 'CLEAR_ERROR' });
    };

    const translateCtx = {
        currentLeaflet: state.currentLeaflet,
        leaflets: state.leaflets,
        error: state.error,
        saveLeaflet,
        addNewLeaflet,
        selectLeaflet,
        handleLeafletNameChange,
        getTranslation,
        downloadDocFile: onDownloadFileClick,
        addSection,
        deleteSection,
        changeInputText,
        updateOutputText,
        fetchLeaflets,
        deleteLeaflet,
        clearError
    };

    return (
        <TranslateContext.Provider value={translateCtx}>
           {children}
        </TranslateContext.Provider>
    );
}