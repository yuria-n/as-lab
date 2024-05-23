import * as React from 'react';

export function Sk(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={20} height={20} viewBox="0 0 60 60" {...props}>
      <title>Sk</title>
      <path
        d="M30 0c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30C13.431 60 0 46.569 0 30 0 13.431 13.431 0 30 0zm0 4C15.64 4 4 15.64 4 30s11.64 26 26 26 26-11.64 26-26S44.36 4 30 4zm-8.133 10.219c1.68 0 3.112.338 4.297 1.015 1.211.677 2.454 1.83 3.73 3.457l-2.988 2.852-.178-.255c-1.377-1.913-2.945-2.87-4.705-2.87-1.328 0-2.428.41-3.3 1.23-.873.82-1.309 1.85-1.309 3.086 0 .99.3 1.843.898 2.559.3.339.74.723 1.319 1.152.58.43 1.305.905 2.178 1.426 2.59 1.51 4.323 2.878 5.195 4.102.885 1.237 1.328 2.858 1.328 4.863 0 2.604-.86 4.713-2.578 6.328-1.693 1.615-3.926 2.422-6.7 2.422-2.239 0-4.133-.482-5.683-1.445-.781-.482-1.51-1.11-2.187-1.885-.677-.775-1.329-1.716-1.954-2.822l3.399-2.305.185.319c.86 1.456 1.703 2.47 2.53 3.04.885.612 2.038.918 3.457.918 1.575 0 2.809-.416 3.701-1.25.892-.833 1.338-2.018 1.338-3.554 0-1.055-.326-1.947-.977-2.676-.325-.378-.81-.801-1.455-1.27a31.754 31.754 0 00-2.451-1.582c-2.266-1.34-3.848-2.617-4.746-3.828-.86-1.21-1.29-2.728-1.29-4.55 0-2.436.847-4.454 2.54-6.055 1.693-1.615 3.828-2.422 6.406-2.422zM39.5 12.012L36.824 33.75l7.735-7.148h5.761L40.672 35l7.754 10H43.21l-6.7-8.75L35.438 45h-4.316l4.063-32.988H39.5z"
        fill="#E3B43C"
        fillRule="nonzero"
      />
    </svg>
  );
}