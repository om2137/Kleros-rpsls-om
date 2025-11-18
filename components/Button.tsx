'use client'

interface Button{
    lable:string;
    background?: string;
    style?:string;
    disabled?:boolean;
    onClick: () => void
}

export default function Button({lable, background, style, disabled, onClick}:Button) {
  return (
    <button
        className={`
                ${background ? background : 'bg-sky-950 text-white'}
                ${style ? style:'px-2 py-1 rounded mx-1'}
                cursor-pointer
            }`}
        disabled={disabled}
        onClick={onClick}
    >
        {lable}
    </button>
  )
}
