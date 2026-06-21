FROM fedora:latest

# Install Dependencies
RUN dnf -y update
RUN dnf -y install autoconf automake make cmake bzip2 gcc-c++
RUN dnf -y install libtool libatomic bison xz which
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

# Build the final WASM binaries (Web and Node)
RUN mkdir -p /build/web/ && mkdir -p /build/node/

# Emscripten no longer statically links .so files by default (they are now treated as dynamic WASM side-modules). 
# If we try to compile with the .so directly, Emscripten outputs a tiny 30KB WASM stub that fails at runtime 
# because it tries to dynamically load the .so file over the network.
# To fix this without requiring explicit MAIN_MODULE dynamic linking setups, we manually gather 
# all of the compiled object files (.o) and bundle them into a single static library archive (.a) using emar.
RUN source /emsdk/emsdk_env.sh && \
    find /ngspice/release/src -name "*.o" \
    | grep '\.libs/' \
    | xargs emar rcs /ngspice/release/src/libngspice_static.a

# Compile the Web build
RUN source /emsdk/emsdk_env.sh && \
    em++ -lpthread -o /build/web/ngspice.js /src/*.cpp /ngspice/release/src/libngspice_static.a \
         -s ENVIRONMENT='web' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 \
         -s EXPORTED_RUNTIME_METHODS=HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAP64,HEAPU64,HEAPF32,HEAPF64 \
         -s EXPORTED_FUNCTIONS=_malloc,_free \
         -s TOTAL_STACK=33554432

# Compile the Node build
RUN source /emsdk/emsdk_env.sh && \
    em++ -lpthread -o /build/node/ngspice_node.js /src/*.cpp /ngspice/release/src/libngspice_static.a \
         -s ENVIRONMENT='node' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 \
         -s EXPORTED_RUNTIME_METHODS=HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAP64,HEAPU64,HEAPF32,HEAPF64 \
         -s EXPORTED_FUNCTIONS=_malloc,_free \
         -s TOTAL_STACK=33554432

# Default command will copy the build files into /mnt/build/
CMD mkdir -p /mnt/build/ && cp -r /build/* /mnt/build/