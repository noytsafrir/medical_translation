// import LoadingLogo from '../loadingLogo/LoadingLogo';

// export default function OutputTextArea({translation, isTranslating}) {
//     return (
//       <div className="flex flex-col flex-grow space-y-2 w-2/12">
//          {isTranslating ? (
//         <div className="rounded-md border p-2 w-full h-56 flex items-center justify-center bg-gray-200">
//           <LoadingLogo />
//         </div>
//       ) : (
//         <textarea 
//           className="rounded-md border p-2 w-full h-56 text-black bg-gray-200" 
//           value={translation}
//           placeholder='Translated Text Here...'
//           readOnly 
//         />
//       )}
//       </div>
//     );
// }
import LoadingLogo from '../loadingLogo/LoadingLogo';

export default function OutputTextArea({translation, isTranslating}) {
    return (
      <div className="flex flex-col flex-grow space-y-2 w-2/12">
         {isTranslating ? (
        <div className="rounded-md border p-2 w-full h-56 flex items-center justify-center bg-gray-200">
          <LoadingLogo />
        </div>
      ) : (
        <div 
          // className="rounded-md border p-2 w-full h-56 text-black bg-gray-200 overflow-hidden"
          className="rounded-md border p-2 w-full h-56 text-black bg-gray-200
                    [&_h1]:font-bold [&_h1]:underline [&_h1]:text-xl
                    [&_h2]:font-bold [&_h2]:text-lg"

          dangerouslySetInnerHTML={{ __html: translation }}
          style={{
            overflowY: 'auto',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        />
      )}
      </div>
    );
}