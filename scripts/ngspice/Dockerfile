FROM fedora:latest

# Install Dependencies
RUN dnf -y update
RUN dnf -y install autoconf automake make cmake bzip2 gcc-c++
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
RUN sed -i "s/AC_CHECK_FUNCS(\[times getrusage\])/AC_CHECK_FUNCS(\[times\])/g" ./configure.ac

## Remove template specialization of is_compound for dual::dual
RUN sed -i '/^\/\/\/ Duals are compound types\.$/,/^struct is_compound<duals::dual<T>> : true_type {};$/d' /ngspice/src/include/cppduals/duals/dual

## Begin compilation
RUN source /emsdk/emsdk_env.sh && \
    ./autogen.sh
RUN mkdir release
WORKDIR /ngspice/release/

## Run configuration to generate Makefiles
## Need to disable-xspice for now because of a weird build error. We should look into re-enabling it in the future.
RUN source /emsdk/emsdk_env.sh && \
    emconfigure ../configure --disable-debug --disable-openmp --disable-xspice --with-ngshared CC="emcc" CXX="em++" CFLAGS="-O2" LDFLAGS="-s"

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