FROM fedora:latest

# Install Dependencies
RUN dnf -y update
RUN dnf -y install autoconf automake make cmake bzip2 gcc-c++ libstdc++-static.x86_64
RUN dnf -y install libtool bison xz which
RUN dnf -y install git wget curl
RUN dnf clean all

# Get and build emscripten
RUN git clone https://github.com/emscripten-core/emsdk.git /emsdk
RUN /emsdk/emsdk install latest
RUN /emsdk/emsdk activate latest

# Clone NGSpice repo and build
RUN git clone https://git.code.sf.net/p/ngspice/ngspice /ngspice
WORKDIR /ngspice/

## Remove `getrusage` since Emscripten doesn't support it as a syscall
RUN sed -i "s/AC_CHECK_FUNCS(\[time getrusage\])/AC_CHECK_FUNCS(\[time\])/g" ./configure.ac

## Begin compilation
RUN source /emsdk/emsdk_env.sh && \
    ./autogen.sh
RUN mkdir release
WORKDIR /ngspice/release/

## Run configuration to generate Makefiles
RUN source /emsdk/emsdk_env.sh && \
    emconfigure ../configure --disable-debug --with-ngshared CC="emcc" CXX="em++" CFLAGS="-O2" LDFLAGS="-s"

## Run build
RUN source /emsdk/emsdk_env.sh && \
    emmake make

# Copy over interface files
RUN mkdir /src/
RUN cp /ngspice/src/include/ngspice/sharedspice.h /src/
COPY ./src/* /src/

# Build the final WASM binary
RUN mkdir /build/
RUN source /emsdk/emsdk_env.sh && \
    em++ -lpthread -o /build/ngspice.js /src/*.cpp /ngspice/release/src/.libs/libngspice.so.0.0.* \
         -s ENVIRONMENT='web' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1

# Default command will copy the build files into /mnt/build/
CMD mkdir -p /mnt/build/ && cp /build/* /mnt/build/