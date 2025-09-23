import Image from "next/image";

export const PukparaLogo = () => {
	const originalWidth = 145;
	const originalHeight = 55;
	const height = 40;
	const width = Math.round((originalWidth * height) / originalHeight);

	return (
		<div className="flex h-full items-center">
			<Image
				alt="Pukpara logo"
				height={height}
				priority
				src="/pukpara-logo.png"
				width={width}
			/>
		</div>
	);
};
