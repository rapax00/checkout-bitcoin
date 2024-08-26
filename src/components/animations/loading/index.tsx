import Lottie from 'lottie-react';
import animationData from './loading.json'; // 160x220px

const style = {
  height: 200,
  width: 200,
};

const containerStyle = {
  height: 300,
  width: 300,
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export default function Loading() {
  return (
    <div style={containerStyle}>
      <Lottie animationData={animationData} style={style} />
    </div>
  );
}
